function makeShield(){
	var currentShield = new Object();
	var tokenKey = "tokenInfo"
	var shieldServer = 'http://localhost:59244';

	function shield(){
		return currentShield;
	}

	shield.registration = function(email, password, confirmPassword){
		var data = {
			Email: email,
			Password: password,
			ConfirmPassword: confirmPassword
		};
		$.ajax({
			type: 'POST',
			url: shieldServer+'/api/Account/Register',
			contentType: 'application/json; charset=utf-8',
			data: JSON.stringify(data)
		}).success(function (data) {
			alert('USPEH');
		}).fail(function (data) {
			alert('NO');
			console.log(data);
		});
	};

	shield.authorization = function(login, password){
		var data = {
			grant_type: 'password',
			username: login,
			password: password
		};
		$.ajax({
			type: 'POST',
			url: shieldServer+'/Token',
			data: data
		}).success(function (data) {
			shield.setRules(data);
		}).fail(function (data) {
			console.log(data);
		});
	};

	shield.logout = function(){
		sessionStorage.removeItem(tokenKey);
	}

	shield.setRules = function(data){
		$('#user-name').text(data.userName);
		$('#modal-logout').css('display', 'block');
		$('#modal-auth').css('display', 'none');
		sessionStorage.setItem(tokenKey, data.access_token);
	};

	return shield;
};