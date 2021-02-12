'use strict';

class Office {
	constructor(oUser) {
		this.iconSize = 32
		this.oUser = oUser
		this.init()
	}

	async init() {
		// canvas
		this.initCanvas()

		// data
		await this.prepareData()
		this.prepareImages()
		//console.log(this.tableCoords)
		//console.log(this.busyTables)

		this.draw()
		this.events()
	}

	initCanvas() {
		// canvas
		this.layer = $('#layer')
		this.canvas = this.layer.find('canvas')
		this.ctx = this.canvas[0].getContext('2d')
	}

	async prepareData() {
		this.tableCoords = await this.getTablesCoords()	
		this.busyTables = await this.getBusyTables()
	}

	prepareImages() {
		this.images = {}

		for(let k in this.oUser.users) {
			let user = this.oUser.users[k]
			let img = new Image(this.iconSize, this.iconSize)
			img.src = user.avatar

			this.images[user.id] = img
		}
	}

	/* ajax */
	getTablesCoords() {
		return new Promise(resolve => {
			$.get('/ajax/table.php', (res) => {
				resolve(res)
			})
		})
	}

	getBusyTables() {
		return new Promise(resolve => {
			$.get('/ajax/booking.php', (res) => {
				resolve(res)
			})
		})
	}

	postBooking(userId, tableId) {
		return new Promise(resolve => {
			$.post('/ajax/booking.php', { tableId: tableId, userId: userId }, (res) => {
				resolve(res)					
			})
		})
	}

	deleteBooking(userId, tableId) {
		return new Promise(resolve => {
			$.ajax({
				url: '/ajax/booking.php',
				type: 'DELETE',
				data: {
					tableId: tableId,
					userId: userId
				},
				success: (res) => {
					resolve(res)
				}	
			})
		})
	}
	/* -------------- */

	/* actions */
	draw() {
		for(let i = 0; i < this.tableCoords.length; i++) {
			let tableId = this.tableCoords[i].id
			let pos = this.tableCoords[i].coords;

			// красим занятые столы
			if(this.busyTables.map(el => el.table_id).indexOf(tableId) != -1) {
				this.ctx.fillStyle = Color.busy
			}
			// красим свободные столы
			else {
				this.ctx.fillStyle = Color.free
			}
			// красим свой стол
			let myBusyTable = this.busyTables.filter(el => el.table_id == tableId);
			if(myBusyTable.length > 0 && myBusyTable[0].user_id == this.oUser.currentUserID) {
				this.ctx.fillStyle = Color.my
			}

			this.ctx.fillRect(pos[0]+1, pos[1]+1, pos[2]-pos[0]-1, pos[3]-pos[1]-1)

			// на занятые иконочку добавляем
			if(this.busyTables.map(el => el.table_id).indexOf(tableId) != -1) {
				let userId = this.busyTables.filter(el => el.table_id == tableId)[0].user_id;
				this.drawIcon(userId, pos)
			}
		}

		// если пользователь не выбран, вырубаем возможность взаимодействия с офисом
		this.canvas.css('pointer-events', this.oUser.currentUserID ? '' : 'none')
	}

	clear() {
		this.ctx.clearRect(0, 0, this.canvas[0].width, this.canvas[0].height)
		this.canvas.css('cursor', '')
	}

	async redraw() {
		this.clear()
		//this.prepareData()
		this.busyTables = await this.getBusyTables()
		await this.draw()
	}

	drawIcon(userId, pos) {
		let img = this.images[userId]
		if(!!img) {
			let size = img.width
			this.ctx.drawImage(img, pos[0] + (pos[2] - pos[0]) / 2 - size / 2, pos[1] + (pos[3] - pos[1]) / 2 - size / 2, size, size)
		}
	}
	/* -------------- */


	/* Events */
	events() {
		this.mouseMoveEvent()
		this.mouseClickEvent()
		this.changeUser()
	}

	mouseMoveEvent() {
		this.canvas.on('mousemove', (e) => {
			// clear
			this.clear()

			// draw free
			this.draw()

			// get coord
			let target = e.toElement.getBoundingClientRect();
			let x = e.clientX - target.left;
			let y = e.clientY - target.top;
			//console.log(x + " " + y)

			// draw 
			this.ctx.fillStyle = Color.mouseOn
			for(let i = 0; i < this.tableCoords.length; i++) {
				let tableId = this.tableCoords[i].id
				let pos = this.tableCoords[i].coords

				let myBusyTable = this.busyTables.filter(el => el.table_id == tableId);

				// если стол не занят или мой
				if(this.busyTables.map(el => el['table_id']).indexOf(tableId) == -1 || myBusyTable.length > 0 
					&& myBusyTable[0].user_id == this.oUser.currentUserID) {
					if(x >= pos[0] && y >= pos[1] && x <= pos[2] && y <= pos[3]) {
						this.ctx.fillRect(pos[0]+1, pos[1]+1, pos[2]-pos[0]-1, pos[3]-pos[1]-1)
						this.canvas.css('cursor', 'pointer')
						break
					}
				}
			}
		})
	}

	mouseClickEvent() {
		this.canvas.on('click', async (e) => {
			// get coord
			let target = e.toElement.getBoundingClientRect();
			let x = e.clientX - target.left;
			let y = e.clientY - target.top;
			//console.log(x + " " + y)

			let iHaveBooking = this.busyTables.filter(el => el['user_id'] == this.oUser.currentUserID).length > 0

			for(let i = 0; i < this.tableCoords.length; i++) {
				let tableId = this.tableCoords[i].id
				let pos = this.tableCoords[i].coords
				// если кликнули на стол
				if(x >= pos[0] && y >= pos[1] && x <= pos[2] && y <= pos[3]) {
					let myBusyTable = this.busyTables.filter(el => el.table_id == tableId);
					// если этот стол либо свободный
					if(this.busyTables.map(el => el['table_id']).indexOf(tableId) == -1) {
						let message = iHaveBooking ? 'Ты уже занял другой столик, хочешь перебронировать?' : 'Уверен, что хочешь забронить этот стол?';
						new Modal(message, async () => {
							let res = await this.postBooking(this.oUser.currentUserID, tableId)
							if(res == 'error') {
								alert('Не удалось забронировать место')
							}
							this.redraw()
						}, { buttons: { okButton: 'Да', closeButton: 'Нет' } }).show()
					}
					// либо мой
					else if(myBusyTable.length > 0 && myBusyTable[0].user_id == this.oUser.currentUserID) {
						new Modal('Хочешь снять броньку?', async () => {
							let res = await this.deleteBooking(this.oUser.currentUserID, tableId)
							if(res == 'error') {
								alert('Не удалось снять бронь')
							}
							this.redraw()
						}, { buttons: { okButton: 'Да', closeButton: 'Нет' } }).show()
					}
					break
				}
			}
		})
	}

	changeUser() {
		$('#userSelect').on('change', (e) => {
			this.redraw()
		})
	}
	/* -------------- */
}