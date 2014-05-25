
$.fn.modalForm = function (options) {

    var defaults = {
        destroy: true,
        open: function (modal, target) { },
        submit: function (modal, target, data) { },
        close: function (modal, target, event) { }
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
            $('.modal-body', modal).load(this.href, function() {
                $('.modal-body .buttons', modal).hide();
                $('.modal-title', modal).html(title);
            });

            // hook open. called afte the modal is built and loaded
            if (typeof defaults.open === 'function') {
                defaults.open.call(modal, target);
            }
            
            // open the BS modal
            modal.modal();

            // form submission event
            $('.button-submit', modal).click(function (ev) {
                ev.preventDefault();

                var form = $('form', modal);
                var buttons = $('.button-submit, .button-cancel', modal);
                buttons.prop('disabled', true);

                $.ajax({
                    type: form.attr('method'),
                    url: form.attr('action'),
                    data: form.serialize()
                }).done(function (data) {

                    // call hook submit
                    if (typeof defaults.submit === 'function') {
                        defaults.submit.call(modal, target, data);
                    }

                    buttons.prop('disabled', false);
                });
            });

            // hook close. to be called after the modal is closed and hidden
            if (typeof defaults.close === 'function') {
                modal.on('hidden.bs.modal', function (event) {
                    defaults.close.call(modal, target, event);
                });
            }

            // see if we want to remove the item
            modal.on('hidden.bs.modal', function (event) {
                if (true === defaults.destroy) {
                    $('#' + target).data('bs.modal', null);
                    $('#' + target).remove();
                }
            });
        });
    });

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
                        '<div class="modal-messages"></div>' +
                        '<div class="modal-body" style="background-color:white;"></div>' +
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