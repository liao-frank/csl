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
			let	dashboard = data.dashboard;
			// render widgets
			renderWidgets(dashboard.widgets);
			// render main message
			renderHeader(dashboard.title, dashboard.message);
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
	});
	function addWidget(widget, index) {
		if (!checkWidgetFields(widget)) alertToast('failure', 'widget is missing information');
		else if (duplicateWidgetFields(widget)) alertToast('failure', 'duplicate widget exists');
		else {
			let	widgets = widget_list.widgets,
				new_widgets = widgets.slice(0);
			// console.log(new_widgets);
			if (index) new_widgets.splice(index, 0, widget);
			else new_widgets.push(widget);

			socket.emit('update_widgets', {
				category: current_category.category,
				widgets: new_widgets
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
	function checkWidgetFields(widget) {
		const required_fields = ['title', 'label', 'content_type'];
		for (let i = 0; i < required_fields.length; i++) {
			let field = required_fields[i];
			if (!widget[field]) {
				return false;
			}
		}
		return true;
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
	function renderWidgets() {
		let	dashboard = data.dashboard,
			category = dashboard.category,
			widgets = dashboard.widgets;
		if (!widgets && category == current_category.category) {
			alertToast('failure', 'no data could be found');
		} else if (category == current_category.category) {
			for (let i = 0; i < widget_list.widgets.length; i++) {
				setTimeout(() => {
					widget_list.widgets.pop();
				}, 0);
			}
			setTimeout(() => {
				widget_list.widgets = widgets.filter(widget => checkWidgetFields(widget));
			}, 0);
		}
	}

	// validators
	function validDashboard(dashboard) {
		if (dashboard) return true;
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
	// remove listeners for old widgets
	socket.off('get_data');
}