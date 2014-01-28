function myLogin(userName, password)
{
	//debugger;
	var theEmployee = ds.Employee({login:userName});
	if (theEmployee == null) // if no user was found
	   return false; // let Wakanda try to find a user in the directory
	else
	{
		// see of the stored hash value is correct
		if (theEmployee.password == directory.computeHA1(userName, password)) 
		{
			var theTitle = '';
			if (theEmployee.title != null)
				theTitle = ', ' + theEmployee.title;
			var myLoginInfo = {myEmployeeID: theEmployee.ID};
			if (theEmployee.manager != null)				
					myLoginInfo.myManagerID = theEmployee.manager.ID;
			var theGroups = ['Employee'];
			if (theEmployee.directReports.length > 0)
				theGroups.push('Manager');
			return {ID: theEmployee.ID, 
					name: theEmployee.login, 
					fullName: theEmployee.fullName + theTitle, 
					belongsTo: theGroups,
					storage : {loginInfo: myLoginInfo}
					}
		}
		else
			return { error: 1024, errorMessage:"invalid login" };
	}
};
