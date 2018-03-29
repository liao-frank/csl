// DEFINE DASHBOARD SOCKET EVENT
(function() {
	let current_category = 'weather';

	socket.on('get_widgets', (data) => {
		let	category = data.category,
			widgets = data.widgets;
		if (!widgets && category == current_category) {
			alert('no data could be found');
		} else if (category == current_category) {
			widget_list.widgets = widgets;
		}
	});
	// on update 
	socket.on('update_widgets', (data) => {
		let	category = data.category,
			widgets = data.widgets;
		if (!widgets && category == current_category) {
			alert('widget list failed to update');
		}
		else if (category == current_category) {
			alert('widget list successfully updated');
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
})();

// weather activation functions
function activateWeather(weather) {
	// implement activate weather
}