var Media = function (
         id,
         customerid,
         originname,
         filename,
         fileext,
         filetype,
         filesize,
         filepath,
         fileurl
         ) {
    var self = this;
    self.Id = id;
    self.CustomerId = customerid;
    self.OriginName = originname;
    self.FileName = filename;
    self.FileExt = fileext;
    self.FileType = filetype;
    self.FileSize = filesize;
    self.FilePath = filepath;
    self.FileUrl = fileurl;
    self.guid = '';
    self.editmode = '';
    self.isedit = false;
    self.allowedit = true;
    self.allowremove = true;
    self.oldvalue = {};
    self.valmanager = new ValidationManager();
            
    self.CustomerName = "";
};
