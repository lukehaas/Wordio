var util = {

	queueHandler:function(queque,i) {

		setTimeout(function() {
			$.when(queue[i].action()).then(function() {
				if(i<queue.length-1) {
					i++;
					util.queueHandler(queue,i);
				}
			});
		},queue[i].time);
	}
};