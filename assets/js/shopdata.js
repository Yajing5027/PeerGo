(function(){
  var CAMPUS_ADDRESS = '7 Centennial Student Union, Mankato, MN 56001';

  var SHOP_LOGOS = {
    tacoBell: '/assets/images/brands/TacoBell.png',
    starbucks: '/assets/images/brands/Starbucks_Corporation_Logo_2011.svg.webp',
    chickFilA: '/assets/images/brands/Chick-fil-A-Logo.png',
    einstein: '/assets/images/brands/einstein-bros-logo.png'
  };

  var CRAWLED_SHOPS_RAW = [
    {
      id: 'taco-bell',
      name: 'Taco Bell',
      tagline: 'Live Mas tacos, burritos, and sides',
      logoUrl: SHOP_LOGOS.tacoBell,
      description: 'Menu sample extracted from Taco Bell web menu data and product image links.',
      sourceUrls: ['https://www.tacobell.com/food'],
      categories: [
        {
          id: 'best-sellers',
          name: 'Best Sellers',
          items: [
            { name: 'Cheesy Gordita Crunch', desc: 'Seasoned beef with spicy ranch in gordita shell.', price: 6.49, image: 'https://www.tacobell.com/images/22813_cheesy_gordita_crunch_750x340.jpg' },
            { name: 'Crunchwrap Supreme', desc: 'Grilled tortilla with beef, nacho cheese, and crunch.', price: 6.99, image: 'https://www.tacobell.com/images/22362_crunchwrap_supreme_750x340.jpg' },
            { name: 'Chicken Quesadilla', desc: 'Marinated chicken and three-cheese blend.', price: 6.79, image: 'https://www.tacobell.com/images/22321_quesadilla_750x340.jpg' },
            { name: 'Nachos BellGrande', desc: 'Chips, beef, beans, nacho cheese, and toppings.', price: 6.59, image: 'https://www.tacobell.com/images/22502_nachos_bellgrande_750x340.jpg' },
            { name: 'Chalupa Supreme', desc: 'Crispy chalupa shell with beef and sour cream.', price: 6.39, image: 'https://www.tacobell.com/images/22850_chalupa_supreme_750x340.jpg' }
          ]
        },
        {
          id: 'tacos-and-burritos',
          name: 'Tacos & Burritos',
          items: [
            { name: 'Soft Taco', desc: 'Classic soft taco with seasoned beef.', price: 2.29, image: 'https://www.tacobell.com/images/22110_soft_taco_750x340.jpg' },
            { name: 'Crunchy Taco', desc: 'Crunchy shell taco with beef and lettuce.', price: 2.29, image: 'https://www.tacobell.com/images/22100_crunchy_taco_750x340.jpg' },
            { name: 'Spicy Potato Soft Taco', desc: 'Potato taco with chipotle sauce and lettuce.', price: 2.49, image: 'https://www.tacobell.com/images/22259_spicy_potato_soft_taco_750x340.jpg' },
            { name: 'Beefy 5-Layer Burrito', desc: 'Five-layer burrito with beef and beans.', price: 4.29, image: 'https://www.tacobell.com/images/22167_beefy_5_layer_burrito_750x340.jpg' },
            { name: 'Cheesy Bean and Rice Burrito', desc: 'Bean, rice, and nacho cheese burrito.', price: 2.19, image: 'https://www.tacobell.com/images/22283_cheesy_bean_and_rice_burrito_750x340.jpg' }
          ]
        },
        {
          id: 'fries-and-drinks',
          name: 'Fries & Drinks',
          items: [
            { name: 'Nacho Fries', desc: 'Seasoned fries with nacho cheese dip.', price: 3.49, image: 'https://www.tacobell.com/images/28095_nacho_fries_750x340.jpg' },
            { name: 'Large Nacho Fries', desc: 'Large seasoned fry serving.', price: 4.49, image: 'https://www.tacobell.com/images/28183_nacho_fries_large_750x340.jpg' },
            { name: 'Seasoned Fries', desc: 'Classic seasoned fries side.', price: 2.99, image: 'https://www.tacobell.com/images/28068_seasoned_fries_640x650.jpg' },
            { name: 'Premium Hot Coffee', desc: 'Hot brewed coffee.', price: 2.29, image: 'https://www.tacobell.com/images/1527_premium_hot_coffee_750x340.jpg' },
            { name: 'Regular Iced Coffee', desc: 'Cold brewed coffee over ice.', price: 2.49, image: 'https://www.tacobell.com/images/1534_iced_regular_coffee_750x340.jpg' }
          ]
        }
      ]
    },
    {
      id: 'starbucks',
      name: 'Starbucks',
      tagline: 'Handcrafted drinks and bakery favorites',
      logoUrl: SHOP_LOGOS.starbucks,
      description: 'Menu sample built from Starbucks menu categories (Drinks, Food, At Home Coffee) with web-accessible Starbucks image assets.',
      sourceUrls: ['https://www.starbucks.com/menu'],
      categories: [
        {
          id: 'drinks',
          name: 'Drinks',
          items: [
            { name: 'Caffe Latte', desc: 'Espresso with steamed milk and light foam.', price: 5.95, image: 'https://www.starbucks.com/weblx/images/social/summary_square.png' },
            { name: 'Caramel Macchiato', desc: 'Vanilla syrup, milk, espresso, and caramel drizzle.', price: 6.45, image: 'https://www.starbucks.com/weblx/images/social/summary_square.png' },
            { name: 'Cappuccino', desc: 'Espresso with thick milk foam.', price: 5.75, image: 'https://www.starbucks.com/weblx/images/social/summary_square.png' },
            { name: 'Cold Brew', desc: 'Slow-steeped coffee served cold.', price: 5.45, image: 'https://www.starbucks.com/weblx/images/social/summary_square.png' },
            { name: 'Iced Shaken Espresso', desc: 'Shaken espresso with ice and milk.', price: 6.25, image: 'https://www.starbucks.com/weblx/images/social/summary_square.png' }
          ]
        },
        {
          id: 'food',
          name: 'Food',
          items: [
            { name: 'Butter Croissant', desc: 'Classic flaky all-butter croissant.', price: 3.95, image: 'https://www.starbucks.com/weblx/images/placeholder.png' },
            { name: 'Chocolate Croissant', desc: 'Buttery pastry with chocolate center.', price: 4.25, image: 'https://www.starbucks.com/weblx/images/placeholder.png' },
            { name: 'Double-Smoked Bacon Sandwich', desc: 'Bacon, egg, and cheddar on croissant bun.', price: 6.95, image: 'https://www.starbucks.com/weblx/images/placeholder.png' },
            { name: 'Spinach, Feta & Egg White Wrap', desc: 'Whole-wheat wrap with egg whites and spinach.', price: 6.45, image: 'https://www.starbucks.com/weblx/images/placeholder.png' },
            { name: 'Tomato & Mozzarella Panini', desc: 'Toasted panini with tomato and mozzarella.', price: 7.25, image: 'https://www.starbucks.com/weblx/images/placeholder.png' }
          ]
        },
        {
          id: 'at-home-coffee',
          name: 'At Home Coffee',
          items: [
            { name: 'Pike Place Roast Beans', desc: 'Smooth medium-roast whole bean coffee.', price: 12.95, image: 'https://www.starbucks.com/weblx/images/location-icon.png' },
            { name: 'Veranda Blend Beans', desc: 'Light-roast Latin American blend.', price: 12.95, image: 'https://www.starbucks.com/weblx/images/location-icon.png' },
            { name: 'Caffe Verona Beans', desc: 'Dark cocoa-rich blend.', price: 13.45, image: 'https://www.starbucks.com/weblx/images/location-icon.png' },
            { name: 'Espresso Roast Beans', desc: 'Caramelly sweet dark roast.', price: 13.45, image: 'https://www.starbucks.com/weblx/images/location-icon.png' },
            { name: 'Decaf House Blend Beans', desc: 'Balanced decaf medium roast.', price: 12.95, image: 'https://www.starbucks.com/weblx/images/location-icon.png' }
          ]
        }
      ]
    },
    {
      id: 'chick-fil-a',
      name: 'Chick-fil-A',
      tagline: 'Chicken sandwiches, nuggets, and sides',
      logoUrl: SHOP_LOGOS.chickFilA,
      description: 'Menu sample parsed from Chick-fil-A menu page cards and menu taxonomy links.',
      sourceUrls: ['https://www.chick-fil-a.com/menu'],
      categories: [
        {
          id: 'breakfast',
          name: 'Breakfast',
          items: [
            { name: 'Sausage, Egg & Cheese Biscuit', desc: 'Savory sausage biscuit breakfast sandwich.', price: 5.29, image: 'https://www.chick-fil-a.com/wp-content/uploads/sites/2/2026/03/CFA_Spring26_Bacon-Egg-Cheese_Sausage-Egg-Cheese_Biscuit_Meal_US_Beauty.tif_cfa_web_ready_52e233.jpg' },
            { name: 'Bacon, Egg & Cheese Biscuit', desc: 'Smoky bacon breakfast biscuit.', price: 5.29, image: 'https://www.chick-fil-a.com/wp-content/uploads/sites/2/2026/03/CFA_Spring26_Bacon-Egg-Cheese_Sausage-Egg-Cheese_Biscuit_Meal_US_Beauty.tif_cfa_web_ready.jpg' },
            { name: 'Hash Browns', desc: 'Crispy bite-size hash browns.', price: 2.35, image: 'https://www.chick-fil-a.com/wp-content/uploads/sites/2/2025/04/menu-item-breakfast.png?w=100' },
            { name: 'Breakfast Biscuit Meal', desc: 'Breakfast sandwich served with side and drink.', price: 7.49, image: 'https://www.chick-fil-a.com/wp-content/uploads/sites/2/2026/03/CFA_Spring26_Bacon-Egg-Cheese_Sausage-Egg-Cheese_Biscuit_Meal_US_Beauty.tif_cfa_web_ready_52e233.jpg?resize=1024,778' },
            { name: 'Iced Coffee', desc: 'Cold-brewed coffee over ice.', price: 3.49, image: 'https://www.chick-fil-a.com/wp-content/uploads/sites/2/2026/03/CFA_Spring26_Bacon-Egg-Cheese_Sausage-Egg-Cheese_Biscuit_Meal_US_Beauty.tif_cfa_web_ready.jpg?resize=744,565' }
          ]
        },
        {
          id: 'entrees',
          name: 'Entrees',
          items: [
            { name: 'Chick-fil-A Chicken Sandwich', desc: 'Original pressure-cooked chicken sandwich.', price: 5.49, image: 'https://www.chick-fil-a.com/wp-content/uploads/sites/2/2025/04/menu-item-entrees.png?w=100' },
            { name: 'Chick-fil-A Nuggets', desc: 'Tender bite-sized chicken nuggets.', price: 5.95, image: 'https://www.chick-fil-a.com/wp-content/uploads/sites/2/2026/02/CFA_Spring26_JalapenoRanchClub_Meal_Beauty_US_MenuLP_Entrees_D_649x742.jpg' },
            { name: '8 ct Chick-fil-A Nuggets', desc: 'Eight-piece nugget serving.', price: 6.15, image: 'https://www.chick-fil-a.com/wp-content/uploads/sites/2/2026/02/CFA_Spring26_JalapenoRanchClub_Meal_Beauty_US_MenuLP_Entrees_D_649x742.jpg?resize=420,480' },
            { name: 'Jalapeno Ranch Club', desc: 'Filet with jalapeno ranch flavor profile.', price: 7.29, image: 'https://www.chick-fil-a.com/wp-content/uploads/sites/2/2026/02/CFA_Spring26_JalapenoRanchClub-Platform_Beauty_US_The-Feed_StoryHeader_D_1274x664.jpg' },
            { name: 'Spicy Filet Sandwich', desc: 'Spicy seasoned filet sandwich option.', price: 6.29, image: 'https://www.chick-fil-a.com/wp-content/uploads/sites/2/2026/02/CFA_Spring26_JalapenoRanchClub-Platform_Beauty_US_The-Feed_StoryHeader_D_1274x664.jpg?resize=768,400' }
          ]
        },
        {
          id: 'sides-and-treats',
          name: 'Sides & Treats',
          items: [
            { name: 'Waffle Potato Fries', desc: 'Crispy waffle-cut potato fries.', price: 3.15, image: 'https://www.chick-fil-a.com/wp-content/themes/cfa/patterns/images/sides.jpeg' },
            { name: 'Side Salad', desc: 'Fresh greens and toppings.', price: 4.95, image: 'https://www.chick-fil-a.com/wp-content/themes/cfa/patterns/images/salads.jpg' },
            { name: 'Garden Salad', desc: 'Mixed greens side salad.', price: 5.25, image: 'https://www.chick-fil-a.com/wp-content/themes/cfa/patterns/images/salads.jpg' },
            { name: 'Milkshake Treat', desc: 'Classic hand-spun shake.', price: 4.95, image: 'https://www.chick-fil-a.com/wp-content/uploads/sites/2/2025/04/menu-item-treats.png?w=100' },
            { name: 'Fresh Lemonade', desc: 'House-made lemonade.', price: 3.45, image: 'https://www.chick-fil-a.com/wp-content/uploads/sites/2/2025/04/menu-item-beverages.png?w=100' }
          ]
        }
      ]
    },
    {
      id: 'einstein-bros-bagels',
      name: 'Einstein Bros. Bagels',
      tagline: 'Bagels, breakfast sandwiches, and coffee',
      logoUrl: SHOP_LOGOS.einstein,
      description: 'Menu sample extracted from Einstein Bros category pages and image assets.',
      sourceUrls: ['https://www.einsteinbros.com/menu'],
      categories: [
        {
          id: 'bagels-and-shmear',
          name: 'Bagels & Shmear',
          items: [
            { name: 'Half Dozen Bagel Box', desc: 'Six assorted bagels.', price: 10.99, image: 'https://www.einsteinbros.com/wp-content/uploads/2023/10/EBB-Half-Dozen-Bagel-Box.jpg' },
            { name: 'Gourmet Green Chile Bagel', desc: 'Savory chile-flavored bagel.', price: 2.59, image: 'https://www.einsteinbros.com/wp-content/uploads/2023/10/EBB-Bagel-Gourmet-Green-Chile.jpg' },
            { name: 'Signature Asiago Bagel', desc: 'Asiago cheese topped bagel.', price: 2.59, image: 'https://www.einsteinbros.com/wp-content/uploads/2023/10/EBB-Bagel-Signature-Asiago.jpg' },
            { name: 'Classic Plain Bagel', desc: 'Traditional plain bagel.', price: 2.29, image: 'https://www.einsteinbros.com/wp-content/uploads/2023/10/EBB-Bagel-Classic-Plain.jpg' },
            { name: 'Hot Honey Shmear', desc: 'Sweet and spicy cream cheese spread.', price: 1.99, image: 'https://www.einsteinbros.com/wp-content/uploads/2026/02/HotHoneyShmear_Hand_NEW_2048x2048-1-1024x1024.jpg' }
          ]
        },
        {
          id: 'breakfast-and-lunch',
          name: 'Breakfast & Lunch',
          items: [
            { name: 'Farmhouse Signature Egg Sandwich', desc: 'Egg sandwich on fresh bagel.', price: 7.49, image: 'https://www.einsteinbros.com/wp-content/uploads/2023/10/EBB-SignatureEgg-Farmhouse-650x6501-1.jpg' },
            { name: 'Hot Honey Egg Sandwich', desc: 'Egg sandwich with hot honey flavor.', price: 7.79, image: 'https://www.einsteinbros.com/wp-content/uploads/2026/02/HotHoneyEgg_NEW_2048x2048-1-1024x1024.jpg' },
            { name: 'Brunch Box', desc: 'Group brunch box combo.', price: 14.99, image: 'https://www.einsteinbros.com/wp-content/uploads/2025/05/EBB-BrunchBox-480x480-1.png' },
            { name: 'Hot Honey Nova Lox', desc: 'Nova lox with hot honey profile.', price: 9.29, image: 'https://www.einsteinbros.com/wp-content/uploads/2026/02/HotHoneyNovaLox_NEW_2048x2048-1-1024x1024.jpg' },
            { name: 'Pepperoni Pizza Bagel', desc: 'Toasted bagel topped with pepperoni and cheese.', price: 6.49, image: 'https://www.einsteinbros.com/wp-content/uploads/2023/10/EBB-Pepperoni-Pizza-Bagel.jpg' }
          ]
        },
        {
          id: 'beverages-and-sweets',
          name: 'Beverages & Sweets',
          items: [
            { name: 'Mocha', desc: 'Chocolate flavored coffee beverage.', price: 4.45, image: 'https://www.einsteinbros.com/wp-content/uploads/2023/10/EBB-Mocha-650c6501.jpg' },
            { name: 'Iced Coffee', desc: 'Chilled brewed coffee.', price: 3.95, image: 'https://www.einsteinbros.com/wp-content/uploads/2023/10/EBB-Iced-Coffee-1.jpg' },
            { name: 'Caramel Coldbrew Shake', desc: 'Cold brew with caramel notes.', price: 5.49, image: 'https://www.einsteinbros.com/wp-content/uploads/2025/06/EBB-Coldbrew-Shake-Caramel-1-1.jpg' },
            { name: 'Blueberry Muffin', desc: 'Soft muffin with blueberries.', price: 3.79, image: 'https://www.einsteinbros.com/wp-content/uploads/2023/10/EBB-Sweets-BlueberryMuffin-650x6501-1.jpg' },
            { name: 'Chocolate Chip Cookie', desc: 'Classic cookie side.', price: 2.49, image: 'https://www.einsteinbros.com/wp-content/uploads/2023/10/EBB-Sweets-ChocolateChipCookie-650x6501-1.jpg' }
          ]
        }
      ]
    }
  ];

  // 为避免页面在运行时去请求外部图片，将每个菜品的 image 指向商家本地 logo（如有需要可替换为更细粒度的本地图片）
  try{
    CRAWLED_SHOPS_RAW.forEach(function(shop){
      var logo = shop.logoUrl || '';
      (shop.categories || []).forEach(function(cat){
        (cat.items || []).forEach(function(item){
          try{ item.image = logo; }catch(e){}
        });
      });
    });
  }catch(e){}

  window.MAVSIDE_SHOPDATA = {
    address: CAMPUS_ADDRESS,
    logos: SHOP_LOGOS,
    raw: CRAWLED_SHOPS_RAW
  };
})();