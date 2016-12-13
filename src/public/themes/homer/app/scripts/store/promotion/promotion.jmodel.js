var Promotion = function (
         id,
         type,
         name,
         description,
         startdate,
         stopdate,
         requirecoupon,
         position,
         status
         ) {
    var self = this;
    self.Id = id;
    self.Type = type;
    self.Name = name;
    self.Description = description;
    self.StartDate = parseJsonDate(startdate);
    self.StartDateF = parseJsonDateF(startdate);
    self.StopDate = parseJsonDate(stopdate);
    self.StopDateF = parseJsonDateF(stopdate);
    self.RequireCoupon = requirecoupon;
    self.Position = position;
    self.Status = status==1?true:false;
    self.guid = '';
    self.editmode = '';
    self.isedit = false;
    self.allowedit = true;
    self.allowremove = true;
    self.oldvalue = {};
    self.valmanager = new ValidationManager();
            
};
