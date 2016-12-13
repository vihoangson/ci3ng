var IncomeDetail = function (
         id,
         incomeid,
         productid,
         quantity,
         unitprice,
         discount,
         note
         ) {

    var self = this;
    if(discount==null) discount = 0;
    if(quantity==null) quantity = 1;
    if(unitprice==null) unitprice = 0;
    self.Id = id;
    self.IncomeId = incomeid;
    self.ProductId = productid;
    self.Quantity = quantity;
    self.UnitPrice = unitprice;
    self.Discount = discount;
    self.Note = note;
    self.guid = '';
    self.editmode = '';
    self.isedit = false;
    self.allowedit = true;
    self.allowremove = true;
    self.oldvalue = {};
    self.valmanager = new ValidationManager();
            
    self.IncomeName = "";
    self.ProductName = "";

    self.Total = parseFloat(quantity)*parseFloat(unitprice) - (parseFloat(quantity)*parseFloat(unitprice) * parseFloat(discount) /100) ;
    self.InvoiceNo = "";
    self.InvoiceDateF = "";
    self.CustomerName = "";
    self.UpdateStock = true;
    self.IncomeType = "";
};
