# Implementation Plan - CraftNest Handmade Products Marketplace

CraftNest is a Django-based handmade products marketplace where users can browse, search, purchase, wishlist, review, and track handmade items. Administrators and sellers can manage inventory, orders, payments, and support requests.

---

## Proposed System Design & Aesthetic
We will design CraftNest with a premium, modern artisan aesthetic:
- **Color Palette**: Rich warm tones, clay and terracotta accents, soft creams, dark slate for text/dark elements, and gold details to invoke a high-end "handmade" craft store feel.
- **Typography**: Stylish, clean fonts (e.g., *Playfair Display* for headers, *Inter* or *Outfit* for body text via Google Fonts).
- **Aesthetics**: Glassmorphism components, soft shadows, rounded corners, and micro-animations on hover to make the page interactive.
- **Responsiveness**: Fully optimized for mobile, tablet, and desktop screens.

---

## Proposed Changes

### Project Setup and Database Modeling

#### 1. Setup Django Project and Dependencies
- Create Django project `craftnest` and app `marketplace`.
- Install `Pillow` for image handling.
- Configure `settings.py` to use a custom user model `marketplace.User`, specify media root/urls, and set template/static paths.

#### 2. Models Implementation
We will implement the following Django models in `marketplace/models.py`:
- **User**: Custom user model inheriting from `AbstractUser` with fields for `first_name`, `last_name`, `email` (unique), `profile_image`, and `date_joined`.
- **Country**: Simple country table.
- **State**: State table linking to `Country`.
- **City**: City table linking to `State`.
- **UserProfile**: Extends `User` with detailed profile info (`address`, `phone_no`, `image`, and references to `city`, `state`, `country`).
- **ProductCategory**: Handmade item categories with `category_name`, `description`, `image`.
- **HandmadeProduct**: Product listings with references to seller (`User`) and `ProductCategory`, featuring fields like `product_name`, `description`, `price`, `stock`, `material`, main `image`, and `created_at`.
- **ProductImage**: Supporting gallery images for each product.
- **ProductCart**: Cart items linking `User` and `HandmadeProduct` with quantity, price, order_id, and order_status.
- **Order**: Orders tracking purchasing details, quantity, total price, shipping address, date of order, delivery date, and status (Pending, Shipped, Delivered).
- **Payment**: Payment information mapping user/order with status (Pending, Completed, Failed), payment method, and amount.
- **Wishlist**: Tracks saved products per user.
- **Review**: Product reviews with a 1-5 rating, comment, and timestamp.
- **ContactUs**: Stores user inquiry messages.

---

### Core Views and Pages

1. **Authentication**: Register, Login, Logout views with custom forms styled with floating labels and validation.
2. **Homepage**:
   - Featured carousel of handcraft categories.
   - Dynamic product showcase of recently added and popular items.
   - Seller highlights and user testimonials/reviews.
3. **Shop / Product Browse**:
   - Filters: Category, Material, Price range, Stock status.
   - Search: Instant search bar filtering by name/description.
   - Sorting: Price (Low to High / High to Low), Date (Newest first), Rating.
4. **Product Details Page**:
   - Interactive image carousel showing main product image and additional gallery images.
   - Materials, seller info, stock status.
   - Reviews section: display star-rated reviews and comment form for users who purchased the product.
   - Quantity selector with "Add to Cart" and "Wishlist" toggles.
5. **Shopping Cart**:
   - Editable product quantity inputs with real-time summary calculation.
   - Items list with direct links and removal.
6. **Checkout & Shipping Page**:
   - Form to select existing or enter new shipping address details (cascading Country -> State -> City).
   - Order summary displaying product items and final prices.
7. **Payment Page**:
   - Beautiful card checkout animation / PayPal integration simulator.
   - Handles simulated payments, creates corresponding `Order` instances, links cart items, updates product inventory levels, and redirects to success screen.
8. **User Profile**:
   - Edit personal info, profile picture, address, phone number, and location selection.
   - Order Tracking timeline: lists all active and historical orders, color-coded by delivery status (Pending, Shipped, Delivered).
9. **Contact Us**:
   - Feedback form that saves to the database and alerts admin.

---

### Admin Dashboard Configuration
We will register all models in the Django admin panel, providing lists, searches, and filters for categories, products, inventory warnings, orders, payments, and reviews.

---

## Verification Plan

### Manual Verification
1. Open browser, register a user, populate profile fields (Country, State, City).
2. Create/edit items through Django Admin or custom seller interfaces.
3. Add products to Wishlist, toggle Wishlist, verify lists.
4. Add items to Cart, adjust quantities, review calculations.
5. Perform checkout, input shipping details, select payment method.
6. Complete payment (verify stock decreases and cart is finalized).
7. Review order history and status progression.
8. Submit review for purchased product, check rating average update.
9. Submit contact form and verify database persistence.
