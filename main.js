let widgetInitialized = false
let firstDataLoad = true
const regenerateDataButton = document.querySelector('.button')
const iframeWrapper = document.querySelector('.widget')
const iframe = document.querySelector('iframe')
let lastDataMessageId = null

window.addEventListener('message', (event) => {
	if (event.data.type === 'editor_widget_initialized') {
		console.log('Widget initialized')
		widgetInitialized = true
		sendMessage('editor_widget_data_change', generateData())
	}
	if (event.data.type === 'editor_widget_height_changed') {
		console.log('Widget height changed', event.data.data)
		iframe.style.height = event.data.data + 'px'
		showIFrameWrapper()
	}
	if (event.data.type === 'editor_widget_params_changed') {
		console.log('Widget params changed', event.data.data)
		sendNewDataWithLoading(1_500)
	}
	if (event.data.type === 'editor_widget_data_received') {
		console.log('Widget data received', event.data.data)
	}
})

regenerateDataButton.addEventListener('click', () => {
	console.log('button clicked')
	sendNewDataWithLoading(1_500)
})

function showIFrameWrapper() {
	if (!firstDataLoad) return

	firstDataLoad = false
	iframeWrapper.style.opacity = '1'
	iframeWrapper.style.height = 'unset'
}

function sendNewDataWithLoading(delay = 0) {
	sendMessage('editor_widget_call_state_change', 'loading')

	sendMessage('editor_widget_data_change', generateData(), delay)

	sendMessage('editor_widget_call_state_change', 'success', delay)
}

function sendMessage(type, data, delay = 0) {
	setTimeout(() => {
		const messageId = crypto.randomUUID()
		if (type === 'editor_widget_data_change') lastDataMessageId = messageId

		iframe.contentWindow.postMessage(
			{
				id: 'asd',
				type,
				messageId,
				data,
			},
			'*'
		)
	}, delay)
}

function generateData() {
	return {
		selects: {
			'select-1': {
				items: [
					{
						label: `Пункт 1`,
						value: '1',
					},
					{
						label: `Пункт 2`,
						value: '2',
					},
					{
						label: `Пункт 3`,
						value: '3',
					},
				],
				activeIndex: 0,
			},
		},
		lists: {
			'itemsList-1': [
				`Первый ${Math.floor(Math.random() * 100)}`,
				`Второй ${Math.floor(Math.random() * 100)}`,
				`Третий ${Math.floor(Math.random() * 100)}`,
				`Четвертый ${Math.floor(Math.random() * 100)}`,
			],
		},
	}
}
