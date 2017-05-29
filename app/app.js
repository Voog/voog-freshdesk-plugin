(function() {
  "use strict";
  return {
    initialize: function() {
      this.options = {
        cb_url:   "{{ iparam.cb_url }}",
        email:    "{{ iparam.email }}",
        password: "{{ iparam.password }}"
      };

      this.search();

      appPlaceholder.ticket.belowRequestorInfo(jQuery(this.$container));
    },

    search: function() {
      var loadingAppText = jQuery(this.$container).find('#voog-app-loading'),
          requester_email = domHelper.ticket.getContactInfo()
            .user.email;

      this.showAppText(loadingAppText);

      this.searchUser(requester_email);
    },

    getAPIUrl: function(path) {
      return this.options.cb_url + path;
    },

    searchUser: function(user_email) {
      var authString = 'Basic ' + btoa(this.options.email + ':' + this.options.password);

      jQuery.ajax({
        url: this.getAPIUrl('/api/support_integrations/users'),
        data: {
          email: user_email
        },
        type: 'GET',
        beforeSend: function(xhr) {
          xhr.setRequestHeader('Authorization', authString);
        },
        dataType: 'json',
        success: this.handleRequestSuccess.bind(this),
        error: this.handleRequestError.bind(this)
      });
    },

    showAppText: function(appTextToShow) {
      var shownAppTexts = jQuery(this.$container).find('.app-text-visible');

      shownAppTexts.removeClass('app-text-visible');

      appTextToShow.addClass('app-text-visible');
    },

    handleRequestError: function(xhr, status, errorString) {
      var errorContainer = jQuery(this.$container).find('#voog-app-error'),
          retryButton = jQuery('<button />');

      retryButton.text('Retry');
      retryButton.click(this.search.bind(this));

      errorContainer.text('Request error: ' + errorString + ' (' + status + ') ');
      errorContainer.append(retryButton);

      this.showAppText(errorContainer);
    },

    handleRequestSuccess: function(data) {
      var successContainer = jQuery(this.$container).find('#voog-app-success'),
          newContent = '';

      newContent += 'Clientbase user: <a href="' + data.url + '" target="_blank">' + data.name + '</a>';

      if (data.phone) {
        newContent += ' (☎' + data.phone + ')';
      }

      newContent += '<br /><br />Accounts: <ol>';

      for (var index = 0; index < data.accounts.length; index++) {
        var account = data.accounts[index];

        newContent += '<li>';
        newContent += '<a href="' + account.url + '" target="_blank">' + account.domain + '</a> (' + account.type + (account.owner?', owner':'') + ')';

        if (account.tags.length > 0) {
          newContent += '<br /> Tags: ' + account.tags.join(', ');
        }

        newContent += '</li>';
      }

      newContent += '</ol>';

      successContainer.html(newContent);

      this.showAppText(successContainer);
    }
  };
})();

