class Legend {
	constructor() {
		this.init()
	}

	init() {
		this.fillLegend()
	}

	fillLegend() {
		let list = ''

		for(let key in Color) {
			let color = Color[key]

			let texts = {
				free: 'Свободное место',
				busy: 'Место занято',
				my: 'Моё место'
			}

			if(Object.keys(texts).indexOf(key) != -1) {
				let text = texts[key]

				list += `<div class="d-flex align-items-center">
					<div class="legendIcon" style="background-color: `+color+`"></div>
					<div class="ml-2"><i><b>`+text+`</b></i></div>
				</div>`
			}
		}

		$('#legend').empty().append(list)
	}
}