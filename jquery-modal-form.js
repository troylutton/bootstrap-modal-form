$.fn.modalForm = function (options) {

    var defaults = {
        destroy: true,
        hasValidation: true,
        useFormButtons: false,
        open: function (modal) { },
        submit: function (modal, element) {
            defaultSubmit(modal, element);
        },
        afterSubmit: function (modal, data) { },
        close: function (modal, event) { },
        message: function (modal, message) {
            // this can be overwritten
            $('#' + modal.attr('id') + ' .modal-message-text').html(message);
            $('.modal-messages', modal).show();
        }
    };

    defaults = $.extend(defaults, options);

    // iterate on matched elements. expecting one or more links to a form
    return this.each(function () {

        // lazy load when clicked
        $(this).click(function (e) {
            e.preventDefault();

            // init
            var element = $(this);
            var modal = null;
            var fragment = element.data('fragment') ? ' ' + element.data('fragment') : '';
            var target = element.data('target');
            var title = element.data('title') ? element.data('title') : this.innerHTML;

            if (!target) {
                // create a modal with id and append it to the document
                target = 'modal-form-' + new Date().getTime();
                modal = createModal(target, title);
            }
            else {
                modal = $(target);
            }

            // load the content into the scoped modal
            $('.modal-body', modal).load(this.href + fragment, function () {

                if (defaults.useFormButtons) {
                    // use the forms buttons rather that the default template
                    $('.modal-footer', modal).replaceWith($('.modal-body .buttons', modal));
                }
                else {
                    // hide the form buttons
                    $('.modal-body .buttons', modal).hide();
                }

                
                $('.modal-title', modal).html(title);

                if (defaults.hasValidation) {
                    // attach validation
                    $.validator.unobtrusive.parse($('form', this));
                }

                // hook open. called afte the modal is built and loaded
                if (typeof defaults.open === 'function') {
                    defaults.open.call(null, modal, element);
                }
            });

            // open the BS modal
            modal.modal();

            // form submission event
            $('.button-submit', modal).click(function (ev) {
                ev.preventDefault();
                defaults.submit.call(null, modal, element);
            });

            // hook close. to be called after the modal is closed and hidden
            if (typeof defaults.close === 'function') {
                modal.on('hidden.bs.modal', function (event) {
                    defaults.close.call(null, modal, event, element);
                });
            }

            // see if we want to remove the item
            modal.on('hidden.bs.modal', function (event) {
                if (true === defaults.destroy) {
                    modal.data('bs.modal', null);
                    modal.remove();
                }
            });
        });
    });

    function defaultSubmit(modal, element) {

        if (defaults.hasValidation) {
            // perform validation
            if (!$('form', modal).valid()) {
                return;
            }
        }

        var form = $('form', modal);
        // modal-footer
        var buttons = $('.modal-footer button, .modal-footer a, .modal-footer input', modal);
        //var buttons = $('.button-submit, .button-cancel', modal);
        buttons.prop('disabled', true);

        $.ajax({
            type: form.attr('method'),
            url: form.attr('action'),
            data: form.serialize()
        }).done(function (data, textStatus, xhr) {

            var contentType = xhr.getResponseHeader("content-type") || "";
            if (contentType.indexOf('html') > -1) {
                // html response - replace the contents
                $('.modal-body', modal).html(data);
                if (defaults.hasValidation) {
                    $.validator.unobtrusive.parse($('form', modal));
                }
            }
            if (contentType.indexOf('json') > -1) {
                // unsuccessful submission - show message
                if (false === data.success) {
                    if (typeof defaults.message === 'function') {
                        defaults.message.call(null, modal, data.message);
                    }
                }
            }

            // call hook submit
            if (typeof defaults.afterSubmit === 'function') {
                defaults.afterSubmit.call(null, modal, data, element);
            }

            buttons.prop('disabled', false);
        });
    }

    // create a basic modal to fillout
    function createModal(target, title) {
        var dynamicModal = $(
            '<div class="modal fade" id="' + target + '" tabindex="-1" role="dialog" aria-labelledby="Modal dialog box" aria-hidden="true">' +
                '<div class="modal-dialog">' +
                    '<div class="modal-content">' +
                        '<div class="modal-header">' +
                            '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' +
                            '<h4 class="modal-title">' + title + '</h4>' +
                        '</div>' +
                        '<div class="modal-messages" style="display:none"><div class="alert alert-error"><span class="modal-message-text"></span></div></div>' +
                        '<div class="modal-body" style="background-color:white;"><img src="/Content/Images/ajax-loader-32x32.gif" /></div>' +
                        '<div class="modal-footer">' +
                            '<button type="button" class="btn btn-default button-cancel" data-dismiss="modal">Close</button>' +
                            '<button type="button" class="btn btn-primary button-submit">Save changes</button>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>');

        $('body').append(dynamicModal);
        return dynamicModal;
    }
}; 