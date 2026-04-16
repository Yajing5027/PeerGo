(function(){
  var rawData = window.MAVSIDE_SHOPDATA && Array.isArray(window.MAVSIDE_SHOPDATA.raw)
    ? window.MAVSIDE_SHOPDATA.raw
    : [];
  var campusAddress = window.MAVSIDE_SHOPDATA && window.MAVSIDE_SHOPDATA.address
    ? window.MAVSIDE_SHOPDATA.address
    : '7 Centennial Student Union, Mankato, MN 56001';

  function normalizeId(value){
    return String(value || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  function toShopModel(rawShop){
    var categories = (rawShop.categories || []).map(function(category){
      var categoryId = normalizeId(category.id || category.name);
      var items = (category.items || []).map(function(item, index){
        return {
          id: rawShop.id + '-' + categoryId + '-' + (index + 1),
          name: item.name,
          desc: item.desc || '',
          price: Number(item.price || 0),
          image: item.image
        };
      });
      return {
        id: categoryId,
        name: category.name,
        items: items
      };
    });

    var heroImages = categories
      .flatMap(function(category){ return category.items || []; })
      .slice(0, 3)
      .map(function(item){ return item.image; });

    return {
      id: rawShop.id,
      name: rawShop.name,
      tagline: rawShop.tagline,
      logoUrl: rawShop.logoUrl,
      description: rawShop.description || '',
      sourceUrls: rawShop.sourceUrls || [],
      address: campusAddress,
      heroImages: heroImages,
      categories: categories
    };
  }

  window.MAVSIDE_FIXED_SHOPS = rawData.map(toShopModel);
})();
