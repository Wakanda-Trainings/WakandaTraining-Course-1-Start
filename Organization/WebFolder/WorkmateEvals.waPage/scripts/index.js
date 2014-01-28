
WAF.onAfterInit = function onAfterInit() {// @lock

// @region namespaceDeclaration// @startlock
	var login1 = {};	// @login
// @endregion// @endlock

// eventHandlers// @lock

	login1.logout = function login1_logout (event)// @startlock
	{// @endlock
		checkLogin();
	};// @lock

	login1.login = function login1_login (event)// @startlock
	{// @endlock
		checkLogin();
	};// @lock
	
	function checkLogin()
		{
			var currUser = WAF.directory.currentUser();
			if (currUser != null)
			{
				try {
					source.workmate.allEntities();
					$$('container3').show();
				} catch (e) {
					source.workmate.noEntities();
				}
				
			}
			else
			{
				source.workmate.noEntities();
				$$('container3').hide();
				$$('login1').showLoginDialog();

			}
		};
// @region eventManager// @startlock
	WAF.addListener("login1", "logout", login1.logout, "WAF");
	WAF.addListener("login1", "login", login1.login, "WAF");
// @endregion
};// @endlock
