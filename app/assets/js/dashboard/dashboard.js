// DEFINE DASHBOARD SOCKET EVENT
let	_addWidget;
let current_category = 'weather';
(function() {
	socket.on('get_widgets', (data) => {
		let	category = data.category,
			widgets = data.widgets;
		if (!widgets && category == current_category) {
			alertToat('failure', 'no data could be found');
		} else if (category == current_category) {
			for (let i = 0; i < widget_list.widgets.length; i++) {
				setTimeout(() => {
					widget_list.widgets.pop();
				}, 0);
			}
			setTimeout(() => {
				widget_list.widgets = widgets;
			}, 0);
		}
	});
	// on update 
	socket.on('update_widgets', (data) => {
		let	category = data.category,
			widgets = data.widgets;
		if (!widgets && category == current_category) {
			alertToast('failure', 'widget list failed to update');
		}
		else if (category == current_category) {
			alertToast('success', 'widget list successfully updated');
			widget_list.widgets = widgets;
		}
	});

	// DEFINE INITIAL EVENTS
	$(document).ready(() => {
		// get widgets and manage current
		requestWidgets(current_category);
		$category_links = $('nav ul li a');
		$category_links.on('click', function() {
			let $this = $(this);
			current_category = $this.data('category');
			$category_links.removeClass('active');
			$this.addClass('active');
			requestWidgets(current_category);
		});
	});

	function requestWidgets(category) {
		socket.emit('get_widgets', {
			category: current_category
		});
	}

	function addWidget(widget, index) {
		const required_fields = ['title', 'label', 'content_type'];
		for (let i = 0; i < required_fields.length; i++) {
			let field = required_fields[i];
			if (!widget[field]) {
				alertToast('failure', 'widget is missing information');
				return;
			}
		}
		let	widgets = widget_list.widgets,
			new_widgets = widgets.slice(0);
		// console.log(new_widgets);
		if (index) new_widgets.splice(index, 0, widget);
		else new_widgets.push(widget);

		socket.emit('update_widgets', {
			category: current_category,
			widgets: new_widgets
		});
	}

	function removeWidget(index) {
		let	widgets = widget_list.widgets,
			new_widgets = widgets.slice(0);
		if (!(index >= 0 && index <= widgets.length)) return;

		new_widgets.splice(index, 1);

		socket.emit('update_widgets', {
			category: current_category,
			widgets: new_widgets
		});
	}

	_addWidget = addWidget;
	_removeWidget = removeWidget;
})();

function alertToast(type, message) {
	toast_list.toasts.push({
		type: type,
		message: message,
		created_at: new Date().getTime()
	});
}

// weather activation functions
function activateWeather(weather) {
	// implement activate weather
}