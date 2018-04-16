// DEFINE DASHBOARD SOCKET EVENT
let	_addWidget;
let current_category = {
	category: 'weather'
};
(function() {
	socket.on('get_dashboard', (data) => {
		// check error
		if (data.err) {
			log('err');
			alertToast('failure', `unable to retrieve category '${current_category.category}'`);
		}
		else if (validDashboard(data.dashboard) && data.dashboard.category == current_category.category) {
			// remove listeners for old widgets
			socket.off('get_data');
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
			log('err');
			alertToast('failure', `unable to update category '${current_category.category}'`);
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
		$(".lock").on('click', function() {
			$(this).toggleClass('unlocked');
			widget_list.editable = !widget_list.editable;
			widget_list.editing_widget = null;
			widget_list.adding_widget = null;
		});
	});
	function addWidget(widget, index) {
		if (!validWidget(widget)) return;
		else {
			let	widgets = widget_list.widgets,
				new_widgets = widgets.slice(0);
			// console.log(new_widgets);
			if (index) new_widgets.splice(index, 0, widget);
			else new_widgets.push(widget);
			socket.emit('update_dashboard', {
				dashboard: {
					category: current_category.category,
					widgets: new_widgets
				}
			});
		}
	}
	function removeWidget(index) {
		let	widgets = widget_list.widgets,
			new_widgets = widgets.slice(0);
		if (!(index >= 0 && index <= widgets.length)) return;

		new_widgets.splice(index, 1);

		socket.emit('update_widgets', {
			category: current_category.category,
			widgets: new_widgets
		});
	}
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

	_addWidget = addWidget;
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