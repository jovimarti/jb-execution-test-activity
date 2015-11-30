define([
    'js/postmonger'
], function(
    Postmonger
) {
    'use strict';

    var connection = new Postmonger.Session();
    var payload = {};
    var lastStepEnabled = false;
    var steps = [ // initialize to the same value as what's set in config.json for consistency
        { "label": "Step 1", "key": "step1" },
        { "label": "Step 2", "key": "step2" },
        { "label": "Step 3", "key": "step3" }
    ];
    var currentStep = null;
    var initialized = false;

    $(window).ready(onRender);

    connection.on('initActivity', initialize);

    connection.on('clickedNext', onClickedNext);
    connection.on('clickedBack', onClickedBack);
    connection.on('gotoStep', onGotoStep);

    function onRender() {
        connection.trigger('ready'); // JB will respond the first time 'ready' is called with 'initActivity'

        connection.trigger('requestTokens');
        connection.trigger('requestEndpoints');

        // Disable the next button if a value isn't selected
        $('#select1').on('change',onMessageChanged);
        $('#select1').on('keyup',onMessageChanged);

        $('#payload').on('change',onPayloadChanged);
        $('#payload').on('keyup',onPayloadChanged);
    }

    function initialize (data) {
        initialized = true;

        if (data) {
            payload = data;

            $( '#initialPayload' ).text( JSON.stringify( data , null , 4 ) );
        } else {
            $( '#initialPayload' ).text( 'initActivity contained no data' );
        }

        var message;
        var hasInArguments = Boolean(
            payload['arguments'] &&
            payload['arguments'].execute &&
            payload['arguments'].execute.inArguments &&
            payload['arguments'].execute.inArguments.length > 0
        );

        var inArguments = hasInArguments ? payload['arguments'].execute.inArguments : {};

        $.each(inArguments, function(index, inArgument) {
            $.each(inArgument, function(key, val) {
                if (key === 'message') {
                    message = val;
                }
            });
        });

        if (message) {
            // If there is a message, fill things in, and if no default was specified, jump to last step
            $('#select1').val(message);
            $('#message').html(message);
            showStep(null, 3);
        } else {
            showStep(null, 1);
        }
    }

    function onClickedNext () {
        if (currentStep.key === 'step3') {
            save();
        } else {
            connection.trigger('nextStep');
        }
    }

    function onClickedBack () {
        connection.trigger('prevStep');
    }

    function onGotoStep (step) {
        showStep(step);
        connection.trigger('ready');
    }

    function onMessageChanged() {
        var message = $('#select1').val();
        connection.trigger('updateButton', { button: 'next', text: 'next', enabled: Boolean(message) });

        $('#message').html(message);
    }

    function onPayloadChanged() {
        if(currentStep && currentStep.key === 'step3') {
            try {
                payload = JSON.parse($('#payload').val());
                updateStep3NextButton(true);
            } catch( e ) {
                updateStep3NextButton(false);
            }
        }
    }

    function updateStep3NextButton(isValid) {
        connection.trigger('updateButton', { button: 'next', text: 'done', visible: true, enabled: isValid });
    }

    function showStep(step, stepIndex) {
        console.log(step, stepIndex);
        if (stepIndex && !step) {
            step = steps[stepIndex-1];
        }

        if( initialized ) {
            if( !currentStep || currentStep.key !== step.key ) {
                connection.trigger('gotoStep', step);
            }

            currentStep = step;
        }

        $('.step').hide();

        switch(step.key) {
            case 'step1':
                $('#step1').show();
                connection.trigger('updateButton', { button: 'next', enabled: Boolean($('#select1').val()) });
                connection.trigger('updateButton', { button: 'back', visible: false });
                break;
            case 'step2':
                $('#step2').show();
                connection.trigger('updateButton', { button: 'back', visible: true });
                connection.trigger('updateButton', { button: 'next', text: 'next', visible: true });
                break;
            case 'step3':
                $('#step3').show();

                preparePayload();
                $('#payload').val(JSON.stringify(payload, null, 4));

                connection.trigger('updateButton', { button: 'back', visible: true });
                updateStep3NextButton(true);
                break;
        }
    }

    function preparePayload() {
        var value = $('#select1').val();

        // payload is initialized on populateFields above.  Journey Builder sends an initial payload with defaults
        // set by this activity's config.json file.  Any property may be overridden as desired.
        payload.name = value;

        payload['arguments'].execute.inArguments = [{ "message": value }];

        payload['metaData'].isConfigured = true;
    }

    function save() {
        connection.trigger('updateActivity', payload);
    }
});
