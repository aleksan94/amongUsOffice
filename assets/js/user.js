'use strict';

class User {
	constructor() {
		this.init()
	}

	async init() {
		this.users = await this.getUsers()
		this.fillUserList()
		this.changeUser()
	}

	/* actions */
	fillUserList() {
		let options = '<option value=""></option>';
		for(let k in this.users) {
			let user = this.users[k]
			options += '<option value="'+user.id+'">'+user.login+'</option>'
		}
		$('#userSelect').empty().append(options)
	}
	/* ----------- */

	/* ajax */
	getUsers() {
		return new Promise(resolve => {
			$.get('/ajax/user.php', (res) => {
				resolve(res)
			})
		})
	}
	/* ----------- */

	/* events */
	changeUser() {
		$('#userSelect').on('change', (e) => {
			this.currentUserID = $(e.target).val()
		})
	}
	/* ----------- */
}