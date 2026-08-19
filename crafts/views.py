import uuid

# Mixin to ensure user is a seller
from django.contrib.auth.mixins import UserPassesTestMixin
from django.contrib.auth.mixins import LoginRequiredMixin

class SellerRequiredMixin(LoginRequiredMixin, UserPassesTestMixin):
    """Ensures the logged‑in user has is_seller=True."""
    def test_func(self):
        return getattr(self.request.user, 'is_seller', False)

    def handle_no_permission(self):
        messages.error(self.request, "Seller access required.")
        return redirect('home')

import random
from decimal import Decimal
from django.shortcuts import render, redirect, get_object_or_404
from django.views.generic import TemplateView, ListView, DetailView, CreateView, UpdateView, DeleteView, View
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib import messages
from django.http import JsonResponse, HttpResponseRedirect
from django.db.models import Q, Avg
from django.urls import reverse
from django.utils import timezone

from crafts.models import (
    User, Country, State, City, UserProfile, ProductCategory, HandmadeProduct,
    ProductImage, ProductCart, Order, Payment, Wishlist, Review, ContactUs
)
from crafts.forms import (
    RegisterForm, UserProfileForm, ReviewForm, ContactUsForm,
    ForgotPasswordForm, VerifyOTPForm, ResetPasswordForm, HandmadeProductForm
)

from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.conf import settings


# Helper to load navigation context (like cart count and categories)
class CartContextMixin:
    def get_context_data(self, **kwargs):
        try:
            context = super().get_context_data(**kwargs)
        except AttributeError:
            context = kwargs

        context['categories_nav'] = ProductCategory.objects.all()
        if hasattr(self, 'request') and self.request and self.request.user.is_authenticated:
            context['cart_count'] = ProductCart.objects.filter(
                user=self.request.user, order_id__isnull=True
            ).count()
            context['wishlist_count'] = Wishlist.objects.filter(
                user=self.request.user
            ).count()
        else:
            context['cart_count'] = 0
            context['wishlist_count'] = 0
        return context

# --- Home View ---
class HomeView(CartContextMixin, TemplateView):
    template_name = 'home.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['categories'] = ProductCategory.objects.all()
        context['featured_products'] = HandmadeProduct.objects.all().order_by('-created_at')[:4]
        context['recent_reviews'] = Review.objects.all().order_by('-review_date')[:3]
        return context

# --- Shop / Product Listing View ---
class ProductListView(CartContextMixin, ListView):
    model = HandmadeProduct
    template_name = 'shop.html'
    context_object_name = 'products'
    paginate_by = 9

    def get_queryset(self):
        queryset = HandmadeProduct.objects.all()
        
        # Search filter
        query = self.request.GET.get('q')
        if query:
            queryset = queryset.filter(
                Q(product_name__icontains=query) | Q(description__icontains=query)
            )

        # Category filter
        category_id = self.request.GET.get('category')
        if category_id:
            queryset = queryset.filter(category_id=category_id)

        # Material filter
        material = self.request.GET.get('material')
        if material:
            queryset = queryset.filter(material__icontains=material)

        # Price range filter
        price_min = self.request.GET.get('price_min')
        price_max = self.request.GET.get('price_max')
        if price_min:
            queryset = queryset.filter(price__gte=price_min)
        if price_max:
            queryset = queryset.filter(price__lte=price_max)

        # Stock status filter
        in_stock = self.request.GET.get('in_stock')
        if in_stock == '1':
            queryset = queryset.filter(stock__gt=0)

        # Sorting
        sort_by = self.request.GET.get('sort')
        if sort_by == 'price_low':
            queryset = queryset.order_by('price')
        elif sort_by == 'price_high':
            queryset = queryset.order_by('-price')
        elif sort_by == 'rating':
            queryset = queryset.annotate(avg_rating=Avg('reviews__rating')).order_by('-avg_rating')
        else:
            queryset = queryset.order_by('-created_at')  # default: newest first

        return queryset

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['categories'] = ProductCategory.objects.all()
        context['materials'] = HandmadeProduct.objects.exclude(material__isnull=True).values_list('material', flat=True).distinct()
        
        # Keep filter selections in template context
        context['selected_category'] = self.request.GET.get('category', '')
        context['selected_material'] = self.request.GET.get('material', '')
        context['price_min'] = self.request.GET.get('price_min', '')
        context['price_max'] = self.request.GET.get('price_max', '')
        context['in_stock'] = self.request.GET.get('in_stock', '')
        context['sort'] = self.request.GET.get('sort', '')
        context['q'] = self.request.GET.get('q', '')
        
        return context

# --- Product Detail View ---
class ProductDetailView(CartContextMixin, DetailView):
    model = HandmadeProduct
    template_name = 'product_detail.html'
    context_object_name = 'product'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        # Fetch additional gallery images
        context['gallery_images'] = self.object.images.all()
        # Fetch product reviews
        context['reviews'] = self.object.reviews.all().order_by('-review_date')
        context['avg_rating'] = self.object.reviews.aggregate(Avg('rating'))['rating__avg'] or 0
        context['review_form'] = ReviewForm()
        
        # Check if the current user has already wishlisted this product
        if self.request.user.is_authenticated:
            context['in_wishlist'] = Wishlist.objects.filter(
                user=self.request.user, product=self.object
            ).exists()
            # Check if user has bought this item (for adding review)
            context['has_purchased'] = Order.objects.filter(
                user=self.request.user, product=self.object, status='delivered'
            ).exists()
        else:
            context['in_wishlist'] = False
            context['has_purchased'] = False
            
        return context

# --- Add Review ---
class AddReviewView(LoginRequiredMixin, View):
    def post(self, request, pk):
        product = get_object_or_404(HandmadeProduct, pk=pk)
        form = ReviewForm(request.POST)
        if form.is_valid():
            review = form.save(commit=False)
            review.user = request.user
            review.product = product
            review.save()
            messages.success(request, "Thank you for your review!")
        else:
            messages.error(request, "There was an error in your review submission.")
        return redirect('product_detail', pk=pk)

# --- Cart Views ---
class CartView(LoginRequiredMixin, CartContextMixin, TemplateView):
    template_name = 'cart.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        cart_items = ProductCart.objects.filter(user=self.request.user, order_id__isnull=True)
        subtotal = sum(item.price * item.quantity for item in cart_items) or Decimal('0.00')
        shipping = Decimal('5.00') if subtotal > 0 else Decimal('0.00')
        tax = subtotal * Decimal('0.05')
        total = subtotal + shipping + tax
        
        context['cart_items'] = cart_items
        context['subtotal'] = subtotal
        context['shipping'] = shipping
        context['tax'] = tax
        context['total'] = total
        return context

class AddToCartView(LoginRequiredMixin, View):
    login_url = 'login'

    def post(self, request, product_id):
        product = get_object_or_404(HandmadeProduct, id=product_id)
        quantity = int(request.POST.get('quantity', 1))

        if quantity > product.stock:
            messages.error(request, f"Sorry, only {product.stock} items left in stock.")
            return redirect('product_detail', pk=product_id)

        # Find existing active (unordered) cart item for this user + product
        cart_item = ProductCart.objects.filter(
            user=request.user,
            product=product,
            order_id__isnull=True
        ).first()

        if cart_item:
            # Check stock before adding more
            if cart_item.quantity + quantity > product.stock:
                messages.error(request, f"Cannot add more. You already have {cart_item.quantity} in cart (max stock: {product.stock}).")
                return redirect('product_detail', pk=product_id)
            cart_item.quantity += quantity
            cart_item.price = product.price
            cart_item.save()
        else:
            # Create a new cart item
            ProductCart.objects.create(
                user=request.user,
                product=product,
                price=product.price,
                quantity=quantity,
                order_id=None,
            )

        messages.success(request, f"✅ {product.product_name} added to cart!")
        return redirect('cart')

class UpdateCartView(LoginRequiredMixin, View):
    def post(self, request, item_id):
        cart_item = get_object_or_404(ProductCart, id=item_id, user=request.user)
        action = request.POST.get('action')
        
        if action == 'increase':
            if cart_item.quantity + 1 > cart_item.product.stock:
                messages.error(request, "Cannot increase quantity. Maximum stock reached.")
            else:
                cart_item.quantity += 1
                cart_item.save()
        elif action == 'decrease':
            if cart_item.quantity > 1:
                cart_item.quantity -= 1
                cart_item.save()
            else:
                cart_item.delete()
                messages.info(request, f"{cart_item.product.product_name} removed from cart.")
                return redirect('cart')
                
        return redirect('cart')

class RemoveFromCartView(LoginRequiredMixin, View):
    def post(self, request, item_id):
        cart_item = get_object_or_404(ProductCart, id=item_id, user=request.user)
        cart_item.delete()
        messages.info(request, "Product removed from cart.")
        return redirect('cart')

# --- Wishlist Views ---
class WishlistView(LoginRequiredMixin, CartContextMixin, TemplateView):
    template_name = 'wishlist.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['wishlist_items'] = Wishlist.objects.filter(user=self.request.user)
        return context

class ToggleWishlistView(LoginRequiredMixin, View):
    def post(self, request, product_id):
        product = get_object_or_404(HandmadeProduct, id=product_id)
        wishlist_item = Wishlist.objects.filter(user=request.user, product=product)
        
        if wishlist_item.exists():
            wishlist_item.delete()
            messages.info(request, f"{product.product_name} removed from Wishlist.")
        else:
            Wishlist.objects.create(user=request.user, product=product)
            messages.success(request, f"{product.product_name} added to Wishlist.")
            
        next_url = request.META.get('HTTP_REFERER', 'shop')
        return HttpResponseRedirect(next_url)

# --- Checkout View ---
class CheckoutView(LoginRequiredMixin, CartContextMixin, View):
    def get(self, request):
        cart_items = ProductCart.objects.filter(user=request.user, order_id__isnull=True)
        if not cart_items.exists():
            messages.warning(request, "Your cart is empty.")
            return redirect('shop')
            
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        form = UserProfileForm(instance=profile)
        
        # Load location choices for AJAX elements
        countries = Country.objects.all()
        
        subtotal = sum(item.price * item.quantity for item in cart_items) or Decimal('0.00')
        shipping = Decimal('5.00')
        tax = subtotal * Decimal('0.05')
        total = subtotal + shipping + tax
        
        context = self.get_context_data()
        context.update({
            'form': form,
            'countries': countries,
            'cart_items': cart_items,
            'subtotal': subtotal,
            'shipping': shipping,
            'tax': tax,
            'total': total,
        })
        return render(request, 'checkout.html', context)

    def post(self, request):
        cart_items = ProductCart.objects.filter(user=request.user, order_id__isnull=True)
        if not cart_items.exists():
            messages.error(request, "Your cart is empty.")
            return redirect('shop')
            
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        
        # Temporarily adjust queryset for form validation
        form = UserProfileForm(request.POST, request.FILES, instance=profile)
        country_id = request.POST.get('country')
        state_id = request.POST.get('state')
        
        if country_id:
            form.fields['state'].queryset = State.objects.filter(country_id=country_id)
        if state_id:
            form.fields['city'].queryset = City.objects.filter(state_id=state_id)

        if form.is_valid():
            form.save()
            
            # Generate group Checkout ID
            checkout_id = f"CN-{uuid.uuid4().hex[:8].upper()}"
            
            # Update all cart items with checkout_id and status
            cart_items.update(order_id=checkout_id, order_status='pending')
            
            # Create Order instance for each cart item
            # The Payment page will handle payment for these items
            for item in cart_items:
                Order.objects.create(
                    user=request.user,
                    product=item.product,
                    quantity=item.quantity,
                    total_price=item.price * item.quantity,
                    shipping_address=profile,
                    status='pending'
                )
                
            return redirect('payment', checkout_id=checkout_id)
        else:
            countries = Country.objects.all()
            subtotal = sum(item.price * item.quantity for item in cart_items) or Decimal('0.00')
            shipping = Decimal('5.00')
            tax = subtotal * Decimal('0.05')
            total = subtotal + shipping + tax
            
            context = self.get_context_data()
            context.update({
                'form': form,
                'countries': countries,
                'cart_items': cart_items,
                'subtotal': subtotal,
                'shipping': shipping,
                'tax': tax,
                'total': total,
            })
            messages.error(request, "Please correct the errors in the shipping details form.")
            return render(request, 'checkout.html', context)

# --- Payment View ---
class PaymentView(LoginRequiredMixin, CartContextMixin, View):
    def get(self, request, checkout_id):
        # Fetch cart items that belong to this checkout
        cart_items = ProductCart.objects.filter(user=request.user, order_id=checkout_id)
        if not cart_items.exists():
            messages.error(request, "Invalid payment session or already paid.")
            return redirect('profile')

        subtotal = sum(item.price * item.quantity for item in cart_items) or Decimal('0.00')
        shipping = Decimal('5.00')
        tax = subtotal * Decimal('0.05')
        total = subtotal + shipping + tax
        
        context = self.get_context_data()
        context.update({
            'checkout_id': checkout_id,
            'cart_items': cart_items,
            'subtotal': subtotal,
            'shipping': shipping,
            'tax': tax,
            'total': total,
            'payment_methods': Payment.PAYMENT_METHOD_CHOICES
        })
        return render(request, 'payment.html', context)

    def post(self, request, checkout_id):
        cart_items = ProductCart.objects.filter(user=request.user, order_id=checkout_id)
        if not cart_items.exists():
            messages.error(request, "Invalid checkout session.")
            return redirect('profile')

        payment_method = request.POST.get('payment_method')
        if not payment_method:
            messages.error(request, "Please select a payment method.")
            return redirect('payment', checkout_id=checkout_id)

        # Simulation processing:
        # Check stock for all items
        for item in cart_items:
            if item.product.stock < item.quantity:
                messages.error(request, f"Sorry, {item.product.product_name} just ran out of stock. Order cancelled.")
                # Rollback checkout_id on cart
                cart_items.update(order_id=None, order_status=None)
                # Delete pending orders created during checkout
                Order.objects.filter(user=request.user, status='pending', product=item.product).delete()
                return redirect('cart')

        # Create Payment records for each Order
        # Find pending orders corresponding to these products created recently
        # To match them cleanly, we can find orders for this user that are 'pending'
        pending_orders = Order.objects.filter(
            user=request.user, 
            status='pending', 
            product__in=[item.product for item in cart_items]
        ).order_by('-order_date')[:cart_items.count()]

        for order in pending_orders:
            # Create payment record
            Payment.objects.create(
                user=request.user,
                order=order,
                amount=order.total_price,
                payment_method=payment_method,
                status='completed'
            )
            # Update product stock
            product = order.product
            product.stock -= order.quantity
            product.save()
            
        # Update order_status in cart items to show purchased
        cart_items.update(order_status='completed')
        
        messages.success(request, "Payment successful! Your order has been placed.")
        return redirect('profile')

# --- Seller Views ---
class SellerDashboardView(SellerRequiredMixin, CartContextMixin, TemplateView):
    template_name = 'seller/dashboard.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        # List only products belonging to this seller
        context['products'] = HandmadeProduct.objects.filter(user=self.request.user).order_by('-created_at')
        return context

class SellerProductCreateView(SellerRequiredMixin, CartContextMixin, CreateView):
    model = HandmadeProduct
    form_class = HandmadeProductForm
    template_name = 'seller/product_form.html'

    def form_valid(self, form):
        form.instance.user = self.request.user
        messages.success(self.request, "Product added successfully!")
        return super().form_valid(form)

    def get_success_url(self):
        return reverse('seller_dashboard')

class SellerProductUpdateView(SellerRequiredMixin, CartContextMixin, UpdateView):
    model = HandmadeProduct
    form_class = HandmadeProductForm
    template_name = 'seller/product_form.html'

    def get_queryset(self):
        return HandmadeProduct.objects.filter(user=self.request.user)

    def form_valid(self, form):
        messages.success(self.request, "Product updated successfully!")
        return super().form_valid(form)

    def get_success_url(self):
        return reverse('seller_dashboard')

class SellerProductDeleteView(SellerRequiredMixin, CartContextMixin, DeleteView):
    model = HandmadeProduct
    template_name = 'seller/product_confirm_delete.html'

    def get_queryset(self):
        return HandmadeProduct.objects.filter(user=self.request.user)

    def post(self, request, *args, **kwargs):
        messages.success(request, "Product deleted successfully!")
        return super().post(request, *args, **kwargs)

    def get_success_url(self):
        return reverse('seller_dashboard')

# --- Profile Views ---
class ProfileView(LoginRequiredMixin, CartContextMixin, TemplateView):
    template_name = 'profile.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        profile, _ = UserProfile.objects.get_or_create(user=self.request.user)
        orders = Order.objects.filter(user=self.request.user).order_by('-order_date')
        
        context['profile'] = profile
        context['orders'] = orders
        return context

class ProfileEditView(LoginRequiredMixin, CartContextMixin, View):
    def get(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        form = UserProfileForm(instance=profile)
        countries = Country.objects.all()
        
        # Prepopulate states and cities querysets based on current selections
        if profile.country:
            form.fields['state'].queryset = State.objects.filter(country=profile.country).order_by('name')
        if profile.state:
            form.fields['city'].queryset = City.objects.filter(state=profile.state).order_by('name')
            
        context = self.get_context_data()
        context.update({
            'form': form,
            'countries': countries,
            'profile': profile
        })
        return render(request, 'profile_edit.html', context)

    def post(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        form = UserProfileForm(request.POST, request.FILES, instance=profile)
        
        # Dynamically set queryset to pass validation
        country_id = request.POST.get('country')
        state_id = request.POST.get('state')
        if country_id:
            form.fields['state'].queryset = State.objects.filter(country_id=country_id)
        if state_id:
            form.fields['city'].queryset = City.objects.filter(state_id=state_id)

        if form.is_valid():
            # Update user profile image if user profile image is uploaded
            profile_instance = form.save(commit=False)
            if profile_instance.image:
                request.user.profile_image = profile_instance.image
                request.user.save()
            profile_instance.save()
            messages.success(request, "Profile updated successfully.")
            return redirect('profile')
            
        countries = Country.objects.all()
        context = self.get_context_data()
        context.update({
            'form': form,
            'countries': countries,
            'profile': profile
        })
        messages.error(request, "Failed to update profile. Please verify all details.")
        return render(request, 'profile_edit.html', context)

# --- Contact View ---
class ContactView(CartContextMixin, View):
    def get(self, request):
        form = ContactUsForm()
        context = self.get_context_data()
        context['form'] = form
        return render(request, 'contact.html', context)

    def post(self, request):
        form = ContactUsForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, "Thank you! Your message has been sent successfully. We will get back to you shortly.")
            return redirect('contact')
        
        context = self.get_context_data()
        context['form'] = form
        messages.error(request, "There was an error in the form. Please review your entries.")
        return render(request, 'contact.html', context)

# --- Authentication Views ---
class RegisterView(CartContextMixin, View):
    def get(self, request):
        if request.user.is_authenticated:
            return redirect('home')
        form = RegisterForm()
        context = self.get_context_data()
        context['form'] = form
        return render(request, 'register.html', context)

    def post(self, request):
        form = RegisterForm(request.POST, request.FILES)
        if form.is_valid():
            user = form.save(commit=False)
            # Set seller flag based on selected role
            role = form.cleaned_data.get('role')
            user.is_seller = (role == 'seller')
            user.set_password(form.cleaned_data['password'])
            user.save()
            
            # Auto-create UserProfile
            UserProfile.objects.create(user=user, image=user.profile_image)
            
            # Log user in
            login(request, user)
            messages.success(request, f"Account created successfully. Welcome, {user.first_name}!")
            # Redirect based on role
            if user.is_seller:
                return redirect('seller_dashboard')
            else:
                return redirect('home')
            
        context = self.get_context_data()
        context['form'] = form
        messages.error(request, "Registration failed. Please correct form errors.")
        return render(request, 'register.html', context)

class LoginView(CartContextMixin, View):
    def get(self, request):
        if request.user.is_authenticated:
            return redirect('home')
        context = self.get_context_data()
        return render(request, 'login.html', context)

    def post(self, request):
        username_or_email = request.POST.get('username')
        password = request.POST.get('password')
        
        # Try to authenticate using username or email
        user = None
        if '@' in username_or_email:
            try:
                user_obj = User.objects.get(email=username_or_email)
                user = authenticate(username=user_obj.username, password=password)
            except User.DoesNotExist:
                pass
        else:
            user = authenticate(username=username_or_email, password=password)
            
        if user is not None:
            login(request, user)
            messages.success(request, f"Welcome back, {user.first_name}!")
            if user.is_seller:
                return redirect('seller_dashboard')
            return redirect('home')
        else:
            messages.error(request, "Invalid username/email or password.")
            context = self.get_context_data()
            context['username'] = username_or_email
            return render(request, 'login.html', context)

class LogoutView(View):
    def get(self, request):
        logout(request)
        messages.info(request, "You have been logged out.")
        return redirect('home')

# Helper to send beautifully styled HTML OTP emails
def send_otp_email(user, otp):
    subject = "Your CraftNest Password Reset OTP Code"
    recipient_name = user.first_name or user.username
    
    plain_message = (
        f"Hello {recipient_name},\n\n"
        f"Your 6-digit OTP code for resetting your CraftNest password is: {otp}\n\n"
        f"This code will expire in 10 minutes. If you did not request this, please ignore this email.\n\n"
        f"Best regards,\n"
        f"The CraftNest Team"
    )

    html_message = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f6f0; margin: 0; padding: 20px; color: #2c3e50; }}
            .email-card {{ max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2d9cd; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }}
            .header {{ background-color: #c8654b; padding: 25px; text-align: center; color: #ffffff; }}
            .header h2 {{ margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 1px; color: #ffffff; }}
            .content {{ padding: 30px 25px; text-align: center; }}
            .greeting {{ font-size: 16px; margin-bottom: 15px; color: #4a4a4a; text-align: left; }}
            .otp-box {{ background-color: #fff5ed; border: 2px dashed #c8654b; border-radius: 10px; padding: 20px; margin: 25px 0; text-align: center; }}
            .otp-code {{ font-size: 36px; font-weight: 800; letter-spacing: 10px; color: #c8654b; font-family: monospace; display: block; margin-bottom: 5px; }}
            .expiry {{ font-size: 13px; color: #888888; font-style: italic; }}
            .footer {{ background-color: #faf7f2; padding: 18px 25px; text-align: center; font-size: 12px; color: #999999; border-top: 1px solid #eeeeee; }}
        </style>
    </head>
    <body>
        <div class="email-card">
            <div class="header">
                <h2>CraftNest</h2>
            </div>
            <div class="content">
                <div class="greeting">Hello <strong>{recipient_name}</strong>,</div>
                <p style="font-size: 14px; color: #555555; text-align: left; line-height: 1.5;">
                    We received a request to reset your password for your CraftNest account. Enter the following 6-digit OTP code on the verification page to proceed:
                </p>
                <div class="otp-box">
                    <span class="otp-code">{otp}</span>
                    <div class="expiry">&#128336; Valid for 10 minutes only</div>
                </div>
                <p style="font-size: 13px; color: #777777; text-align: left; line-height: 1.4;">
                    If you did not request a password reset, you can safely ignore this message. Your account remains completely secure.
                </p>
            </div>
            <div class="footer">
                &copy; 2026 CraftNest. All rights reserved.<br>
                Handmade Products Marketplace
            </div>
        </div>
    </body>
    </html>
    """

    send_mail(
        subject=subject,
        message=plain_message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        html_message=html_message,
        fail_silently=False,
    )


# --- Password Reset Views ---
class ForgotPasswordView(CartContextMixin, View):
    def get(self, request):
        if request.user.is_authenticated:
            return redirect('home')
        form = ForgotPasswordForm()
        context = self.get_context_data()
        context['form'] = form
        return render(request, 'forgot_password.html', context)

    def post(self, request):
        form = ForgotPasswordForm(request.POST)
        if form.is_valid():
            email_or_username = form.cleaned_data['email_or_username']
            user = User.objects.filter(
                Q(email__iexact=email_or_username) | Q(username__iexact=email_or_username)
            ).first()

            if user and user.email:
                # Generate 6-digit OTP
                otp = f"{random.randint(100000, 999999)}"
                request.session['reset_otp'] = otp
                request.session['reset_user_id'] = user.pk
                request.session['reset_email'] = user.email
                request.session['otp_timestamp'] = timezone.now().timestamp()
                request.session['otp_verified'] = False

                try:
                    send_otp_email(user, otp)
                except Exception as e:
                    print(f"Error sending OTP email: {e}")

                messages.success(request, f"A 6-digit OTP verification code has been sent to {user.email}.")
                return redirect('verify_otp')
            else:
                messages.error(request, "No account found matching that username or email address.")

        context = self.get_context_data()
        context['form'] = form
        return render(request, 'forgot_password.html', context)


class VerifyOTPView(CartContextMixin, View):
    def get(self, request):
        reset_email = request.session.get('reset_email')
        if not reset_email:
            messages.warning(request, "Please enter your email first to receive an OTP code.")
            return redirect('forgot_password')

        form = VerifyOTPForm()
        context = self.get_context_data()
        context['form'] = form
        if '@' in reset_email:
            parts = reset_email.split('@')
            name = parts[0]
            masked_name = name[0] + '*' * (len(name) - 2) + name[-1] if len(name) > 2 else name[0] + '*'
            masked_email = f"{masked_name}@{parts[1]}"
        else:
            masked_email = reset_email
            
        context['masked_email'] = masked_email
        return render(request, 'verify_otp.html', context)

    def post(self, request):
        reset_email = request.session.get('reset_email')
        if not reset_email:
            messages.warning(request, "Session expired. Please enter your email again.")
            return redirect('forgot_password')

        form = VerifyOTPForm(request.POST)
        if form.is_valid():
            user_otp = form.cleaned_data['otp']
            session_otp = request.session.get('reset_otp')
            timestamp = request.session.get('otp_timestamp', 0)

            # 10 minutes expiry (600 seconds)
            if timezone.now().timestamp() - timestamp > 600:
                messages.error(request, "The OTP code has expired. Please click Resend OTP to get a new code.")
            elif user_otp == str(session_otp):
                request.session['otp_verified'] = True
                messages.success(request, "OTP code verified successfully! Please enter your new password below.")
                return redirect('password_reset_confirm')
            else:
                messages.error(request, "Invalid OTP code. Please enter the 6-digit code sent to your email.")

        context = self.get_context_data()
        context['form'] = form
        if '@' in reset_email:
            parts = reset_email.split('@')
            name = parts[0]
            masked_name = name[0] + '*' * (len(name) - 2) + name[-1] if len(name) > 2 else name[0] + '*'
            context['masked_email'] = f"{masked_name}@{parts[1]}"
        else:
            context['masked_email'] = reset_email

        return render(request, 'verify_otp.html', context)


class ResendOTPView(View):
    def post(self, request):
        user_id = request.session.get('reset_user_id')
        reset_email = request.session.get('reset_email')
        if not user_id or not reset_email:
            messages.warning(request, "Session expired. Please start over.")
            return redirect('forgot_password')

        user = User.objects.filter(pk=user_id).first()
        if user:
            otp = f"{random.randint(100000, 999999)}"
            request.session['reset_otp'] = otp
            request.session['otp_timestamp'] = timezone.now().timestamp()
            request.session['otp_verified'] = False

            try:
                send_otp_email(user, otp)
            except Exception as e:
                print(f"Error resending OTP email: {e}")

            messages.success(request, "A fresh 6-digit OTP verification code has been sent to your email.")
        return redirect('verify_otp')



class ResetPasswordConfirmView(CartContextMixin, View):
    def get_user_from_token(self, uidb64):
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            return User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return None

    def get(self, request, uidb64=None, token=None):
        user = None
        if uidb64 and token:
            user = self.get_user_from_token(uidb64)
            if user is None or not default_token_generator.check_token(user, token):
                context = self.get_context_data()
                context['validlink'] = False
                return render(request, 'reset_password_invalid.html', context)
        elif request.session.get('otp_verified') and request.session.get('reset_user_id'):
            user = User.objects.filter(pk=request.session.get('reset_user_id')).first()
            if not user:
                context = self.get_context_data()
                context['validlink'] = False
                return render(request, 'reset_password_invalid.html', context)
        else:
            messages.error(request, "Please verify your OTP code before resetting your password.")
            return redirect('forgot_password')

        form = ResetPasswordForm()
        context = self.get_context_data()
        context['form'] = form
        context['uidb64'] = uidb64
        context['token'] = token
        context['validlink'] = True
        return render(request, 'reset_password.html', context)

    def post(self, request, uidb64=None, token=None):
        user = None
        if uidb64 and token:
            user = self.get_user_from_token(uidb64)
            if user is None or not default_token_generator.check_token(user, token):
                context = self.get_context_data()
                context['validlink'] = False
                return render(request, 'reset_password_invalid.html', context)
        elif request.session.get('otp_verified') and request.session.get('reset_user_id'):
            user = User.objects.filter(pk=request.session.get('reset_user_id')).first()
            if not user:
                context = self.get_context_data()
                context['validlink'] = False
                return render(request, 'reset_password_invalid.html', context)
        else:
            messages.error(request, "Session invalid. Please start the password reset process again.")
            return redirect('forgot_password')

        form = ResetPasswordForm(request.POST)
        if form.is_valid():
            new_password = form.cleaned_data['new_password']
            user.set_password(new_password)
            user.save()

            # Clean session variables
            for key in ['reset_otp', 'reset_user_id', 'reset_email', 'otp_timestamp', 'otp_verified']:
                request.session.pop(key, None)

            messages.success(request, "Your password has been successfully reset! You can now log in with your new password.")
            return redirect('password_reset_complete')

        context = self.get_context_data()
        context['form'] = form
        context['uidb64'] = uidb64
        context['token'] = token
        context['validlink'] = True
        return render(request, 'reset_password.html', context)


class PasswordResetCompleteView(CartContextMixin, View):
    def get(self, request):
        context = self.get_context_data()
        return render(request, 'password_reset_complete.html', context)


# --- AJAX location selectors ---
def load_states(request):
    country_id = request.GET.get('country')
    states = State.objects.filter(country_id=country_id).order_by('name')
    return JsonResponse(list(states.values('id', 'name')), safe=False)

def load_cities(request):
    state_id = request.GET.get('state')
    cities = City.objects.filter(state_id=state_id).order_by('name')
    return JsonResponse(list(cities.values('id', 'name')), safe=False)

