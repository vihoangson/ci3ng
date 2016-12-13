var IncomePromotion = function (
         id,
         incomeid,
         promotionname,
         promotiondescription,
         note
         ) {
    var self = this;
    self.Id = id;
    self.IncomeId = incomeid;
    self.PromotionName = promotionname;
    self.PromotionDescription = promotiondescription;
    self.Note = note;
    self.guid = '';
    self.editmode = '';
    self.isedit = false;
    self.allowedit = true;
    self.allowremove = true;
    self.oldvalue = {};
    self.valmanager = new ValidationManager();
            
    self.IncomeName = "";
};
