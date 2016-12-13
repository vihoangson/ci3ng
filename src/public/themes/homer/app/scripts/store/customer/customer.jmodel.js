var Customer = function (
         id,
         title,
         firstname,
         lastname,
         fullname,
         gender,
         dob,
         age,
         postalcode,
         email,
         mobile,
         nric,
         addressline1,
         isloyal
         ) {
    var self = this;
    self.Id = id;
    self.Title = title;
    self.FirstName = firstname;
    self.LastName = lastname;
    self.FullName = fullname;
    self.Gender = gender;
    self.Dob = parseJsonDate(dob);
    self.DobF = parseJsonDateF(dob);
    self.Age = age;
    self.PostalCode = postalcode;
    self.Email = email;
    self.Mobile = mobile;
    self.Nric = nric;
    self.AddressLine1 = addressline1;
    self.IsLoyal = isloyal;
    self.guid = '';
    self.editmode = '';
    self.isedit = false;
    self.allowedit = true;
    self.allowremove = true;
    self.oldvalue = {};
    self.valmanager = new ValidationManager();

    self.DisplayName = "";
    if(title==null){
        self.DisplayName = fullname;
    }else{
        self.DisplayName = title + ". " + fullname;
    }
};
