// DEFINE DASHBOARD SOCKET EVENT
let current_category = {
	category: 'weather'
};
let auth = {
	username: '',
	password: ''
};
(function() {
	socket.on('get_dashboard', (data) => {
		// check error
		if (data.err) {
			log(`unable to retrieve category '${current_category.category}'`, data.err);
			alertToast('failure', `unable to retrieve category '${current_category.category}'`);
		}
		else if (validDashboard(data.dashboard) && data.dashboard.category == current_category.category) {
			// remove listeners for old widgets
			socket.off('get_data');
			// socket.off('get_dashboard');
			let	dashboard = data.dashboard;
			// render widgets
			renderWidgets(dashboard.widgets);
			// render main message
			renderHeader(dashboard.title, dashboard.message);
		} else {
			log(`'get_dashboard' event received w/ bad data\n`, data);
		}
	});
	// on update 
	socket.on('update_dashboard', (data) => {
		// check error
		if (data.err) {
			log(`unable to update category '${current_category.category}'`, data.err);
			alertToast('failure', `no updating in demo version ;)`);
			requestDashboard(current_category);
		}
		else if (validDashboard(data.dashboard) && data.dashboard.category == current_category.category) {
			// remove listeners for old widgets
			socket.off('get_data');
			let	dashboard = data.dashboard;
			// render widgets
			renderWidgets(dashboard.widgets);
			// render main message
			renderHeader(dashboard.title, dashboard.message);
			alertToast('success', 'successfully updated dashboard');
		} else {
			log(`'update_dashboard' event received w/ bad data\n`, data);
		}

		// let	category = data.category,
		// 	widgets = data.widgets;
		// if (!widgets && category == current_category.category) {
		// 	alertToast('failure', 'widget list failed to update');
		// }
		// else if (category == current_category.category) {
		// 	alertToast('success', 'widget list successfully updated');
		// 	widget_list.widgets = widgets.filter(widget => checkWidgetFields(widget));
		// }
	});
	// DEFINE INITIAL EVENTS
	$(document).ready(() => {
		// get widgets and manage current
		requestDashboard(current_category);
		// activate links
		$category_links = $('nav ul li a');
		$category_links.on('click', function() {
			let $this = $(this);
			// update category and effects
			current_category.category = $this.data('category');
			activateGenerator(current_category.category);
			// update link element
			$category_links.removeClass('active');
			$this.addClass('active');
			// request new widgets
			requestDashboard(current_category);
		});
		// edit mode
		$('.lock').on('click', function() {
			if (!$(this).hasClass('unlocked')) {
				authorize(() => {
					$(this).toggleClass('unlocked');
					widget_list.editable = !widget_list.editable;
					widget_list.editing_widget = null;
					widget_list.adding_widget = null;
					main_message.edit_mode = !main_message.edit_mode;
				});
			}
			else {
				$(this).toggleClass('unlocked');
				widget_list.editable = !widget_list.editable;
				widget_list.editing_widget = null;
				widget_list.adding_widget = null;
				main_message.edit_mode = !main_message.edit_mode;
			}
		});
		authorize(()=>{}, request=false);
		// Demo functions
		$('.controls-weather').on('click', function() {
			$(this).toggleClass('active');
		});
		renderDemoIntro();
	});
	function duplicateWidgetFields(widget) {
		const unique_fields = ['title', 'label'];
		for (let other_widget of widget_list.widgets) {
			for (let field of unique_fields) {
				if (other_widget.field == widget.field) return false;
			}
		}
		return true;
	}
	// renderers
	function renderWidgets(widgets) {
		if (!widgets) return;
		else {
			// remove old widgets
			for (let i = 0; i < widget_list.widgets.length; i++) {
				setTimeout(() => {
					widget_list.widgets.pop();
				}, 0);
			}
			// add new widgets
			setTimeout(() => {
				widget_list.widgets = widgets.filter(widget => validWidget(widget));
			}, 0);
		}
	}
	function renderHeader(title, message) {
		if (!title || !message) {
			alertToast('error receiving main message');
		}
		$('.main-message .header').html(title);
		$('.main-message p').html(message);
	}

	// validators
	function validDashboard(dashboard) {
		if (dashboard) return true;
	}
	function validWidget(widget) {
		// const required_fields = ['title', 'label', 'content_type'];
		// for (let i = 0; i < required_fields.length; i++) {
		// 	let field = required_fields[i];
		// 	if (!widget[field]) {
		// 		return false;
		// 	}
		// }
		// return true;
		// TODO
		if (!widget) alertToast('not a valid widget');
		else return true;
	}
	function authorize(callback, request=true) {
		let	username = getCookie('username'),
			password = getCookie('password');

		if (username && password) {
			authorizeServer(username, password, 
				() => {
					callback();
					// create logout
					if ($('a.logout').length == 0) createLogout();
				},
				failure=() => {
					alertToast('failure', 'saved credentials are invalid');
					password = '';
					setCookie('password', '', 0);
					authorizeForm(() => {
						modal.renderContent();
						alertToast('success', 'successfully logged in');
						callback();
					});
				}
			);
		}
		if ((!username || !password) && request) {
			authorizeForm(() => {
				modal.renderContent();
				alertToast('success', 'successfully logged in');
				callback();
			}, failure=() => {
				alertToast('failure', 'incorrect username or password');
			});
		}
	}
	function authorizeForm(success, failure=null) {
		modal.renderContent(($elem) => {
			let $form = $(`
				<form class="authorization-form pure-form pure-form-aligned">
					<fieldset>
						<div class="pure-control-group">
							<label>&nbsp;</label>
							<h2 class="header">Sign In</h2>
						</div>

						<div class="pure-control-group">
							<label>Username</label>
							<input class="username" type="text" placeholder="Username">
						</div>

						<div class="pure-control-group">
							<label>Password</label>
							<input class="password" type="password" placeholder="Password">
						</div>

						<div class="pure-controls">
							<label class="pure-checkbox">
								<input class="remember" type="checkbox"> Remember me for 30 days
							</label>

							<div class="pure-button pure-button-primary">Submit</div>
						</div>
					</fieldset>
				</form>
			`);
			$elem.append($form);
			let username = getCookie('username');
			if (username) $form.find('.username').val(username);
			// set up form
			let sendAuthorizationRequest = () => {
				let	username = $form.find('.username').val(),
					password = $form.find('.password').val();
				authorizeServer(username, password, () => {
					success();
					if ($form.find('.remember').is(':checked')) {
						setCookie('username', username, 10000);
						setCookie('password', password, 30);
						// create logout
						if ($('a.logout').length == 0) createLogout();
					}
				}, () => {
					let $password = $form.find('.password');
					$password.val('');
					$password.focus();
					failure();
				});
			};
			$form.on('keypress', (e) => {
				if (e.which == 13) {
					sendAuthorizationRequest();
				}
			});
			$form.find('.pure-button').on('click', sendAuthorizationRequest);
		}, show=true);
	}
	function authorizeServer(username, password, success, failure=null) {
		socket.emit('authorize', {
			auth: {
				username: username,
				password: password
			}
		});
		socket.on('authorize', (obj) => {
			socket.off('authorize');
			// success
			if (obj.authorized) {
				success();
				auth.username = username;
				auth.password = password;
			}
			// failure
			else if (failure) {
				failure();
			}
		});
	}
	function logout() {
		// delete credentials
		setCookie('password', '', 0);
		// lock
		let $lock = $('.lock');
		if ($lock.hasClass('unlocked')) {
			$lock.toggleClass('unlocked');
			widget_list.editable = !widget_list.editable;
			widget_list.editing_widget = null;
			widget_list.adding_widget = null;
			main_message.edit_mode = !main_message.edit_mode;
		}
		alertToast('success', 'successfully logged out');
		// remove logout link
		$('a.logout').remove();
	}
	function createLogout() {
		// add logout link
		$('footer').append('<a class="logout">Log Out</a>');
		// set up logout link
		$('a.logout').on('click', function() {
			logout();
		});
	}
})();

function alertToast(type, message) {
	toast_list.toasts.push({
		type: type,
		message: message,
		created_at: new Date().getTime()
	});
}
function requestDashboard(category_obj) {
	// request new widgets
	socket.emit('get_dashboard', category_obj);
}
const generator_transition = 'all 0.7s ease';
function activateGenerator(category=current_category.category) {
	$generator = $('.generator'),
	$current_generator = $('.generator-' + category);

	$generator.css('transition',generator_transition);
	$generator.removeClass('generator-active');
	$current_generator.addClass('generator-active');
}
function renderDemoIntro() {
	let intro = generateDemoIntro();
	modal.renderContent(intro, show=true);
}
function generateDemoIntro() {
	let $intro = $(`
	<div class="intro">
		<h2 class="header">Hello there 😊</h2>
		<p>
			Welcome to the demo version of the <a href="https://devpost.com/software/phipps-dashboard" target="_blank">CSL dashboard</a>. Feel free to explore the systems and their interactions. Note* the dashboard was built for a standalone tablet system and is otherwise not responsive. Please view on a desktop or horizontal tablet.
		</p>
		<h3 class="header">Highlights</h3>
		<ul>
			<li>See how the dynamic background/theme automatically updates with weather and time. For this demo, you can manually set these attributes near the CSL graphic.</li>
			<li>Examine how the editable, extensible widgets work. Log in with the 'lock' icon in the upper right corner with <em>(admin : secret)</em>. Updates disabled in demo.</li>
			<li>Notice the custom toast/alert system throughout your interactions. It was built as part of the CMS.</li>
		</ul>
		<span class="signature">Frank Liao</span>
	</div> 
	`);
	return $intro;
}