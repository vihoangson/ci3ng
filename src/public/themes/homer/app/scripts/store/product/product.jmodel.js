var Product = function (
         id,
         type,
         code,
         name,
         summary,
         description,
         image,
         thumbnail,
         quantityperunit,
         saleprice,
         unitprice,
         unitsinstock,
         unitsonorder,
         position,
         categoryid
         ) {
    var self = this;
    self.Id = id;
    self.Type = type;
    self.Code = code;
    self.Name = name;
    self.Summary = summary;
    self.Description = description;
    self.Image = image;
    self.Thumbnail = thumbnail;
    self.QuantityPerUnit = quantityperunit;
    self.SalePrice = saleprice;
    self.UnitPrice = unitprice;
    self.UnitsInStock = unitsinstock;
    self.UnitsOnOrder = unitsonorder;
    self.Position = position;
    self.CategoryId = categoryid;
    self.guid = '';
    self.editmode = '';
    self.isedit = false;
    self.allowedit = true;
    self.allowremove = true;
    self.oldvalue = {};
    self.valmanager = new ValidationManager();
            
    self.CategoryName = "";
};
