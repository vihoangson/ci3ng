var Category = function (
         id,
         name,
         description,
         left,
         right,
         depth,
         parentid
         ) {
    var self = this;
    self.Id = id;
    self.Name = name;
    self.Description = description;
    self.Left = left;
    self.Right = right;
    self.Depth = depth;
    self.ParentId = parentid;
    self.guid = '';
    self.editmode = '';
    self.isedit = false;
    self.allowedit = true;
    self.allowremove = true;
    self.oldvalue = {};
    self.valmanager = new ValidationManager();
            
    self.Parent_name = "";
};
