from django.urls import path
from crafts import views

urlpatterns = [
    # General / Shop
    path('', views.HomeView.as_view(), name='home'),
    path('shop/', views.ProductListView.as_view(), name='shop'),
    path('product/<int:pk>/', views.ProductDetailView.as_view(), name='product_detail'),
    path('product/<int:pk>/review/', views.AddReviewView.as_view(), name='add_review'),
    
    # Cart
    path('cart/', views.CartView.as_view(), name='cart'),
    path('cart/add/<int:product_id>/', views.AddToCartView.as_view(), name='cart_add'),
    path('cart/update/<int:item_id>/', views.UpdateCartView.as_view(), name='cart_update'),
    path('cart/remove/<int:item_id>/', views.RemoveFromCartView.as_view(), name='cart_remove'),
    
    # Wishlist
    path('wishlist/', views.WishlistView.as_view(), name='wishlist'),
    path('wishlist/toggle/<int:product_id>/', views.ToggleWishlistView.as_view(), name='wishlist_toggle'),
    
    # Checkout & Payment
    path('checkout/', views.CheckoutView.as_view(), name='checkout'),
    path('payment/<str:checkout_id>/', views.PaymentView.as_view(), name='payment'),
    
    # Profile & Orders
    path('profile/', views.ProfileView.as_view(), name='profile'),
    path('profile/edit/', views.ProfileEditView.as_view(), name='profile_edit'),
    
    # Seller Panel
    path('seller/dashboard/', views.SellerDashboardView.as_view(), name='seller_dashboard'),
    path('seller/product/add/', views.SellerProductCreateView.as_view(), name='seller_product_add'),
    path('seller/product/edit/<int:pk>/', views.SellerProductUpdateView.as_view(), name='seller_product_edit'),
    path('seller/product/delete/<int:pk>/', views.SellerProductDeleteView.as_view(), name='seller_product_delete'),
    
    # Contact
    path('contact/', views.ContactView.as_view(), name='contact'),
    
    # Authentication & Password Reset
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('forgot-password/', views.ForgotPasswordView.as_view(), name='forgot_password'),
    path('forgot-password/verify/', views.VerifyOTPView.as_view(), name='verify_otp'),
    path('forgot-password/resend-otp/', views.ResendOTPView.as_view(), name='resend_otp'),
    path('reset-password/', views.ResetPasswordConfirmView.as_view(), name='password_reset_confirm'),
    path('reset-password/<uidb64>/<token>/', views.ResetPasswordConfirmView.as_view(), name='password_reset_confirm_token'),
    path('reset-password/complete/', views.PasswordResetCompleteView.as_view(), name='password_reset_complete'),

    
    # AJAX Location Helpers
    path('ajax/load-states/', views.load_states, name='ajax_load_states'),
    path('ajax/load-cities/', views.load_cities, name='ajax_load_cities'),
]
