import os
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.core.files.base import ContentFile
from django.conf import settings
from crafts.models import (
    Country, State, City, UserProfile, ProductCategory, HandmadeProduct, Review
)
from PIL import Image, ImageDraw
import io

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds the database with sample data'

    def handle(self, *args, **kwargs):
        self.stdout.write("Starting database seeding...")
        
        # 1. Ensure media folders exist
        os.makedirs(os.path.join(settings.MEDIA_ROOT, 'profile_images'), exist_ok=True)
        os.makedirs(os.path.join(settings.MEDIA_ROOT, 'category_images'), exist_ok=True)
        os.makedirs(os.path.join(settings.MEDIA_ROOT, 'product_images'), exist_ok=True)
        os.makedirs(os.path.join(settings.MEDIA_ROOT, 'product_gallery'), exist_ok=True)

        # Helper function to generate solid colored images
        def generate_mock_image(color, text, size=(400, 400)):
            img = Image.new('RGB', size, color=color)
            draw = ImageDraw.Draw(img)
            # Draw a simple box border
            draw.rectangle([10, 10, size[0]-10, size[1]-10], outline="white", width=3)
            
            img_io = io.BytesIO()
            img.save(img_io, format='JPEG', quality=85)
            img_io.seek(0)
            return ContentFile(img_io.read(), name=f"{text.replace(' ', '_').lower()}.jpg")

        # 2. Create Countries, States, Cities
        self.stdout.write("Seeding locations (Countries, States, Cities)...")
        usa, _ = Country.objects.get_or_create(name="United States")
        india, _ = Country.objects.get_or_create(name="India")
        
        ca, _ = State.objects.get_or_create(country=usa, name="California")
        ny, _ = State.objects.get_or_create(country=usa, name="New York")
        mh, _ = State.objects.get_or_create(country=india, name="Maharashtra")
        ka, _ = State.objects.get_or_create(country=india, name="Karnataka")
        
        la, _ = City.objects.get_or_create(state=ca, name="Los Angeles")
        sf, _ = City.objects.get_or_create(state=ca, name="San Francisco")
        nyc, _ = City.objects.get_or_create(state=ny, name="New York City")
        mumbai, _ = City.objects.get_or_create(state=mh, name="Mumbai")
        pune, _ = City.objects.get_or_create(state=mh, name="Pune")
        blr, _ = City.objects.get_or_create(state=ka, name="Bengaluru")

        # 3. Create Users
        self.stdout.write("Seeding users...")
        
        # Superuser
        admin_user, created = User.objects.get_or_create(
            username="admin",
            email="admin@craftnest.com",
            defaults={"first_name": "Admin", "last_name": "User", "is_staff": True, "is_superuser": True}
        )
        if created:
            admin_user.set_password("admin123")
            admin_user.save()
            # Generate profile image
            admin_user.profile_image.save("admin_avatar.jpg", generate_mock_image("#d37556", "Admin", (150, 150)))
            admin_user.save()

        # Buyer
        buyer_user, created = User.objects.get_or_create(
            username="buyer",
            email="buyer@craftnest.com",
            defaults={"first_name": "Jane", "last_name": "Doe"}
        )
        if created:
            buyer_user.set_password("buyer123")
            buyer_user.save()
            buyer_user.profile_image.save("buyer_avatar.jpg", generate_mock_image("#8c7355", "Buyer", (150, 150)))
            buyer_user.save()
            
            # UserProfile
            UserProfile.objects.create(
                user=buyer_user,
                address="123 Artisan Way",
                phone_no="+1 555-0192",
                city=la,
                state=ca,
                country=usa,
                image=buyer_user.profile_image
            )

        # Sellers
        seller1, created = User.objects.get_or_create(
            username="clay_artisan",
            email="clay@craftnest.com",
            defaults={"first_name": "Elena", "last_name": "Rostova"}
        )
        if created:
            seller1.set_password("seller123")
            seller1.save()
            seller1.profile_image.save("seller1_avatar.jpg", generate_mock_image("#b95d3e", "Elena", (150, 150)))
            seller1.save()
            UserProfile.objects.create(
                user=seller1,
                address="45 Pottery Lane",
                phone_no="+91 9876543210",
                city=mumbai,
                state=mh,
                country=india,
                image=seller1.profile_image
            )

        seller2, created = User.objects.get_or_create(
            username="wood_crafts",
            email="wood@craftnest.com",
            defaults={"first_name": "Thomas", "last_name": "Oak"}
        )
        if created:
            seller2.set_password("seller123")
            seller2.save()
            seller2.profile_image.save("seller2_avatar.jpg", generate_mock_image("#2b2c28", "Thomas", (150, 150)))
            seller2.save()
            UserProfile.objects.create(
                user=seller2,
                address="77 Timber Rd",
                phone_no="+1 555-8821",
                city=nyc,
                state=ny,
                country=usa,
                image=seller2.profile_image
            )

        # 4. Create Categories
        self.stdout.write("Seeding categories...")
        categories_data = [
            ("Ceramics & Pottery", "Exquisite hand-thrown pottery, earthenware, and porcelain craft.", "#d37556"),
            ("Textures & Weaves", "Handwoven tapestries, carpets, table runners, and macramé arts.", "#8c7355"),
            ("Wooden Carvings", "Rustic handmade wooden carvings, plates, kitchen accessories, and decor.", "#5a4d3f"),
            ("Artisan Jewelry", "Uniquely designed handmade rings, necklaces, and jewelry accessories.", "#d4af37"),
        ]
        
        categories = {}
        for cat_name, desc, color in categories_data:
            cat, created = ProductCategory.objects.get_or_create(
                category_name=cat_name,
                defaults={"description": desc}
            )
            if created:
                img_file = generate_mock_image(color, cat_name, (300, 200))
                cat.image.save(f"cat_{cat.id}.jpg", img_file)
                cat.save()
            categories[cat_name] = cat

        # 5. Create Handmade Products
        self.stdout.write("Seeding products...")
        products_data = [
            {
                "user": seller1,
                "category": categories["Ceramics & Pottery"],
                "product_name": "Hand-thrown Terracotta Vase",
                "description": "A classic rustic flower vase hand-thrown from local clay and dried in an open-air fire. Perfect for dry flowers or boho home decors.",
                "price": 45.00,
                "stock": 10,
                "material": "Clay / Terracotta",
                "color": "#d37556"
            },
            {
                "user": seller1,
                "category": categories["Ceramics & Pottery"],
                "product_name": "Speckled Clay Coffee Mug",
                "description": "Enjoy your morning coffee in this unique textured ceramic coffee mug. Microwave and dishwasher safe, glazed with organic pigments.",
                "price": 22.50,
                "stock": 25,
                "material": "Ceramic Clay",
                "color": "#e0b094"
            },
            {
                "user": seller1,
                "category": categories["Textures & Weaves"],
                "product_name": "Indigo Handwoven Table Runner",
                "description": "100% organic cotton table runner hand-dyed with natural Indigo dye. Beautiful geometric patterns crafted by heritage artisans.",
                "price": 38.00,
                "stock": 5,
                "material": "Organic Cotton",
                "color": "#3f51b5"
            },
            {
                "user": seller2,
                "category": categories["Textures & Weaves"],
                "product_name": "Boho Macrame Wall Hanging",
                "description": "Intricate bohemian style macrame wall hanging, constructed with locally sourced cotton cords and a rustic birch branch.",
                "price": 55.00,
                "stock": 8,
                "material": "Cotton Cord & Birch Wood",
                "color": "#e5dfd3"
            },
            {
                "user": seller2,
                "category": categories["Wooden Carvings"],
                "product_name": "Hand-carved Walnut Serving Board",
                "description": "Premium walnut wood serving board, finely sanded and finished with food-safe mineral oils. Each board exhibits a completely unique grain.",
                "price": 65.00,
                "stock": 4,
                "material": "Walnut Wood",
                "color": "#4e3629"
            },
            {
                "user": seller2,
                "category": categories["Wooden Carvings"],
                "product_name": "Rustic Wooden Coasters Set",
                "description": "A set of 6 cedar wood coasters. Hand cut, branded with geometric lines, and treated to protect against water rings.",
                "price": 18.00,
                "stock": 15,
                "material": "Cedar Wood",
                "color": "#7e5233"
            },
            {
                "user": seller2,
                "category": categories["Artisan Jewelry"],
                "product_name": "Sterling Silver Leaf Ring",
                "description": "Delicate adjustable ring cast in 925 sterling silver, modeled after a beautiful olive leaf found in our local workshop gardens.",
                "price": 32.00,
                "stock": 12,
                "material": "925 Sterling Silver",
                "color": "#b0bec5"
            },
            {
                "user": seller1,
                "category": categories["Artisan Jewelry"],
                "product_name": "Raw Turquoise Pendant Necklace",
                "description": "A stunning raw turquoise stone suspended on a fine 14k gold-filled chain. A elegant statement piece reflecting natural beauty.",
                "price": 75.00,
                "stock": 3,
                "material": "Turquoise & 14k Gold",
                "color": "#26a69a"
            }
        ]

        products = []
        for p_data in products_data:
            prod, created = HandmadeProduct.objects.get_or_create(
                product_name=p_data["product_name"],
                defaults={
                    "user": p_data["user"],
                    "category": p_data["category"],
                    "description": p_data["description"],
                    "price": p_data["price"],
                    "stock": p_data["stock"],
                    "material": p_data["material"]
                }
            )
            if created:
                img_file = generate_mock_image(p_data["color"], p_data["product_name"], (500, 500))
                prod.image.save(f"prod_{prod.id}.jpg", img_file)
                prod.save()
            products.append(prod)

        # 6. Create Reviews
        self.stdout.write("Seeding product reviews...")
        reviews_data = [
            (buyer_user, products[0], 5, "Absolutely beautiful vase! The textures are even nicer in person. Shipped very securely too."),
            (buyer_user, products[1], 4, "Sturdy mug with a comfortable grip. It holds heat well. Marked down by one star only because shipping took a week."),
            (buyer_user, products[4], 5, "Amazing quality! The walnut grain looks incredible, and the oil finish feels premium. Worth every penny."),
        ]

        for user, prod, rating, comment in reviews_data:
            Review.objects.get_or_create(
                user=user,
                product=prod,
                defaults={"rating": rating, "comment": comment}
            )

        self.stdout.write(self.style.SUCCESS("Database seeding completed successfully!"))
