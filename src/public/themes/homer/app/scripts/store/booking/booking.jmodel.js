var Booking = function (
         id,
         customerid,
         service,
         note,
         status,
         requiredat,
         customername,
         customerphone
         ) {
    var self = this;
    self.Id = id;
    self.CustomerId = customerid;
    self.Service = service;
    self.Note = note;
    self.Status = status;
    self.RequiredAt = parseJsonDate(requiredat);
    self.RequiredAtF = parseJsonDateF(requiredat);
    self.CustomerName = customername;
    self.CustomerPhone = customerphone;
    self.guid = '';
    self.editmode = '';
    self.isedit = false;
    self.allowedit = true;
    self.allowremove = true;
    self.oldvalue = {};
    self.valmanager = new ValidationManager();

    self.RequiredAtTime = parseJsonDate(requiredat);
    self.RequiredAtTimeF = parseJsonTimeF(requiredat);
};
