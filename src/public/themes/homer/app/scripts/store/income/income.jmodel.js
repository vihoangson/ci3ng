var Income = function (
         id,
         customerid,
         type,
         invoiceno,
         invoicedate,
         duedate,
         amount,
         description,
         status
         ) {
    var self = this;
    self.Id = id;
    self.CustomerId = customerid;
    self.Type = type;
    self.InvoiceNo = invoiceno;
    self.InvoiceDate = parseJsonDate(invoicedate);
    self.InvoiceDateF = parseJsonDateF(invoicedate);
    self.DueDate = parseJsonDate(duedate);
    self.DueDateF = parseJsonDateF(duedate);
    self.Amount = amount;
    self.Description = description;
    self.Status = status;
    self.guid = '';
    self.editmode = '';
    self.isedit = false;
    self.allowedit = true;
    self.allowremove = true;
    self.oldvalue = {};
    self.valmanager = new ValidationManager();
            
    self.CustomerName = "";

    self.UpdateStock = true;
};
