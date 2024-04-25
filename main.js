const regenerateDataButton = document.querySelector('.button')
const iframeWrapper = document.querySelector('.widget')
const widgetId = 'f46159d8-63a8-4d1a-8951-792177f03503'
let iframe
let widgetInitialized = false
let firstDataLoad = true
let lastDataMessageId = null

// Функция, которая создает iframe динамически (просто для того, чтобы удобно менять widgetId)
function createIFrame() {
	const iframeElement = document.createElement('iframe')
	iframeElement.setAttribute('src', `https://business-qa2.tcsbank.ru/financial-analytics/widgets/${widgetId}`)
	iframeWrapper.appendChild(iframeElement)
	iframe = document.querySelector('iframe')
}
createIFrame()

// Обработчик для сообщений
window.addEventListener('message', (event) => {
	// Сообщение о инициализации виджета
	if (event.data.type === 'editor_widget_initialized') {
		console.log('Widget initialized')
		widgetInitialized = true
		sendMessage('editor_widget_data_change', generateData())
	}

	// Сообщение о изменении высоты виджета
	if (event.data.type === 'editor_widget_height_changed') {
		console.log('Widget height changed', event.data.data)
		iframe.style.height = event.data.data + 'px'
		showIFrameWrapper()
	}

	// Сообщение о изменении параметров виджета (фильтры и тд)
	if (event.data.type === 'editor_widget_params_changed') {
		console.log('Widget params changed', event.data.data)
		sendNewDataWithLoading(1_500)
	}

	// Сообщение о том, что виджет получил данные
	if (event.data.type === 'editor_widget_data_received') {
		console.log('Widget data received', event.data.data)
	}
})

// При клике на кнопку отправит новые данные в виджет
regenerateDataButton.addEventListener('click', () => {
	sendNewDataWithLoading(1_500)
})

// Показывает iframe
function showIFrameWrapper() {
	if (!firstDataLoad) return

	firstDataLoad = false
	iframeWrapper.style.opacity = '1'
	iframeWrapper.style.height = 'unset'
}

// Отсылает в виджет сообщение о изменении статуса на loading,
// а через 1.5 секунд отсылает сообщение с новыми данными и изменением статуса на success
function sendNewDataWithLoading(delay = 0) {
	sendMessage('editor_widget_call_state_change', 'loading')

	sendMessage('editor_widget_data_change', generateData(), delay)

	sendMessage('editor_widget_call_state_change', 'success', delay)
}

// Функция, которая отсылает сообщение в iframe
function sendMessage(type, data, delay = 0) {
	setTimeout(() => {
		const messageId = crypto.randomUUID()
		if (type === 'editor_widget_data_change') lastDataMessageId = messageId

		iframe.contentWindow.postMessage(
			{
				id: widgetId,
				type,
				messageId,
				data,
			},
			'*'
		)
	}, delay)
}

// Функция, которая генерирует данные для виджета
function generateData() {
	const data = {
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
					{
						label: `Пункт 4`,
						value: '4',
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

	if (Math.random() > 0.66) {
		data.lists['itemsList-1'] = data.lists['itemsList-1'].slice(2)
	} else if (Math.random() > 0.33) {
		data.lists['itemsList-1'] = [
			...data.lists['itemsList-1'],
			`Пятый ${Math.floor(Math.random() * 100)}`,
			`Шестой ${Math.floor(Math.random() * 100)}`,
		]
	}

	return data
}
