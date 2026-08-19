from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils import timezone
from django.utils.safestring import mark_safe
from crafts.models import (
    User, Country, State, City, UserProfile, ProductCategory, HandmadeProduct,
    ProductImage, ProductCart, Order, Payment, Wishlist, Review, ContactUs
)

# Custom admin site headers
admin.site.site_header = "CraftNest Marketplace Administration"
admin.site.site_title = "CraftNest Admin Portal"
admin.site.index_title = "Welcome to CraftNest Manager"

# User Admin
@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('avatar_preview', 'username', 'email', 'first_name', 'last_name', 'is_staff', 'is_seller')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    readonly_fields = ('avatar_preview',)
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Custom Profile Info', {'fields': ('profile_image', 'avatar_preview', 'is_seller')}),
    )

    def avatar_preview(self, obj):
        if obj.profile_image:
            return mark_safe(f'<img src="{obj.profile_image.url}" style="height: 40px; width: 40px; object-fit: cover; border-radius: 50%; border: 2px solid #d37556; box-shadow: 0 2px 5px rgba(0,0,0,0.15);" />')
        initials = (obj.username[:2].upper() if obj.username else 'U')
        return mark_safe(f'<span style="display: inline-flex; align-items: center; justify-content: center; width: 36px; height: 36px; background-color: #d37556; color: white; border-radius: 50%; font-weight: bold; font-size: 0.8rem;">{initials}</span>')
    avatar_preview.short_description = 'Avatar'

# Locations admin
@admin.register(Country)
class CountryAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')
    search_fields = ('name',)

@admin.register(State)
class StateAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'country')
    list_filter = ('country',)
    search_fields = ('name',)

@admin.register(City)
class CityAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'state', 'get_country')
    list_filter = ('state__country', 'state')
    search_fields = ('name',)

    def get_country(self, obj):
        return obj.state.country.name
    get_country.short_description = 'Country'

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('image_preview', 'user', 'phone_no', 'country', 'state', 'city')
    search_fields = ('user__username', 'phone_no', 'address')
    list_filter = ('country',)
    readonly_fields = ('image_preview',)

    def image_preview(self, obj):
        if obj.image:
            return mark_safe(f'<img src="{obj.image.url}" style="height: 40px; width: 40px; object-fit: cover; border-radius: 50%; border: 2px solid #d37556; box-shadow: 0 2px 5px rgba(0,0,0,0.15);" />')
        return mark_safe('<span style="color: #999; font-style: italic;">No Image</span>')
    image_preview.short_description = 'Avatar'

# Product & Category admin
@admin.register(ProductCategory)
class ProductCategoryAdmin(admin.ModelAdmin):
    list_display = ('image_preview', 'category_name', 'description')
    search_fields = ('category_name',)
    readonly_fields = ('image_preview',)

    def image_preview(self, obj):
        if obj.image:
            return mark_safe(f'<img src="{obj.image.url}" style="height: 45px; width: 45px; object-fit: cover; border-radius: 8px; border: 1.5px solid #8c7355; box-shadow: 0 2px 5px rgba(0,0,0,0.15);" />')
        return mark_safe('<span style="color: #999; font-style: italic;">No Image</span>')
    image_preview.short_description = 'Image'

class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    readonly_fields = ('image_preview',)

    def image_preview(self, obj):
        if obj.image:
            return mark_safe(f'<img src="{obj.image.url}" style="height: 50px; width: 50px; object-fit: cover; border-radius: 6px; border: 1.5px solid #d37556;" />')
        return ""
    image_preview.short_description = 'Preview'

@admin.register(HandmadeProduct)
class HandmadeProductAdmin(admin.ModelAdmin):
    list_display = ('image_preview', 'product_name', 'user', 'category', 'price', 'stock', 'material', 'created_at')
    list_filter = ('category', 'created_at')
    search_fields = ('product_name', 'description', 'material', 'user__username')
    readonly_fields = ('image_preview',)
    inlines = [ProductImageInline]

    def image_preview(self, obj):
        if obj.image:
            return mark_safe(f'<img src="{obj.image.url}" style="height: 52px; width: 52px; object-fit: cover; border-radius: 8px; border: 2px solid #d37556; box-shadow: 0 2px 6px rgba(0,0,0,0.18);" />')
        return mark_safe('<span style="color: #999; font-style: italic;">No Image</span>')
    image_preview.short_description = 'Image'

@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ('image_preview', 'product', 'image')
    readonly_fields = ('image_preview',)

    def image_preview(self, obj):
        if obj.image:
            return mark_safe(f'<img src="{obj.image.url}" style="height: 60px; width: 60px; object-fit: cover; border-radius: 8px; border: 2px solid #d37556; box-shadow: 0 3px 8px rgba(0,0,0,0.2);" />')
        return mark_safe('<span style="color: #999; font-style: italic;">No Image</span>')
    image_preview.short_description = 'Preview'

# Shopping Cart, Order & Payment admin
@admin.register(ProductCart)
class ProductCartAdmin(admin.ModelAdmin):
    list_display = ('user', 'product', 'price', 'quantity', 'order_id', 'order_status')
    list_filter = ('order_status',)
    search_fields = ('user__username', 'product__product_name', 'order_id')

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'product', 'quantity', 'total_price', 'status', 'order_date', 'delivery_date')
    list_filter = ('status', 'order_date')
    search_fields = ('user__username', 'product__product_name')
    actions = ['mark_as_shipped', 'mark_as_delivered']

    def mark_as_shipped(self, request, queryset):
        queryset.update(status='shipped')
    mark_as_shipped.short_description = "Mark selected orders as Shipped"

    def mark_as_delivered(self, request, queryset):
        queryset.update(status='delivered', delivery_date=timezone.now())
    mark_as_delivered.short_description = "Mark selected orders as Delivered"

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'order', 'amount', 'payment_method', 'status', 'payment_date')
    list_filter = ('status', 'payment_method', 'payment_date')
    search_fields = ('user__username', 'order__id')

# Wishlist, Reviews & Contact admin
@admin.register(Wishlist)
class WishlistAdmin(admin.ModelAdmin):
    list_display = ('user', 'product', 'created_at')
    search_fields = ('user__username', 'product__product_name')

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('user', 'product', 'rating', 'review_date')
    list_filter = ('rating', 'review_date')
    search_fields = ('user__username', 'product__product_name', 'comment')

@admin.register(ContactUs)
class ContactUsAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'subject', 'phone', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('name', 'email', 'subject', 'message')
