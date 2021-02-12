'use strict';

class Modal {
	constructor(text, callback, params = {}) {
		this.id = Math.random().toString(36).replace(/[^a-z]+/g, '')

		this.initDefault()

		this.text = text
		this.callback = callback

		if('buttons' in params && Object.keys(params.buttons).length > 0) {
			let buttons = params.buttons
			this.closeButton = 'closeButton' in buttons ? buttons.closeButton : false
			this.okButton = 'okButton' in buttons ? buttons.okButton : false
		}

		$('body').append(this.prepareHtml())
		this.modal = $('#'+this.id)

		this.initEvents()
	}

	initDefault() {
		this.closeButton = 'Close'
		this.okButton = 'Ok'
	}

	prepareHtml() {
		let html = `<div class="modal fade" id="${this.id}">
				  <div class="modal-dialog" role="document">
				    <div class="modal-content">
				      <div class="modal-body">
				        <p>${this.text}</p>
				      </div>
				      <div class="modal-footer justify-content-center">`

		if(!!this.okButton)
			html +=	`	<button type="button" class="btn btn-primary btn-ok">${this.okButton}</button>`
		if(!!this.closeButton)
			html += `   <button type="button" class="btn btn-secondary btn-close" data-dismiss="modal">${this.closeButton}</button>`

			html += `
				      </div>
				    </div>
				  </div>
				</div>`

		return html
	}

	show() {
		this.modal.modal('show')
	}

	hide() {
		this.modal.modal('hide')
	}

	/* events */
	initEvents() {
		this.okEvent()
		this.onHidden()
	}

	okEvent() {
		this.modal.find('.btn-ok').on('click', (e) => {
			if(!!this.callback && typeof this.callback == 'function')
				this.callback()
			this.hide()
		})
	}

	onHidden() {
		this.modal.on('hidden.bs.modal', () => {
			this.modal.modal('dispose')
			this.modal.remove()
		})
	}
	/* --------- */
}