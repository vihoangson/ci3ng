var ExpenseDetail = function (
         id,
         expenseid,
         productid,
         itemname,
         quantity,
         unitprice
         ) {
    var self = this;
    self.Id = id;
    self.ExpenseId = expenseid;
    self.ProductId = productid;
    self.ItemName = itemname;
    self.Quantity = quantity;
    self.UnitPrice = unitprice;
    self.Total = 0;
    self.guid = '';
    self.editmode = '';
    self.isedit = false;
    self.allowedit = true;
    self.allowremove = true;
    self.oldvalue = {};
    self.valmanager = new ValidationManager();
            
    self.ExpenseName = "";
    self.ProductName = "";
    if(quantity==0) quantity = 1;
    self.Total = parseFloat(quantity)* parseFloat(unitprice);
    self.Description = "";
    self.InvoiceNo = "";
    self.UpdateStock = false;
};
