;(function() {

  var plan_names = ["Small", "Medium", "Large", "ENTERPRISE", "Enterprise-2", "Enterprise-3", "Enterprise-4", "Enterprise-5"];
  var plan_prices = ["35", "100", "350", "5000", "5000", "5000", "5000", "5000"];
  var mix_percentages = ["70", "20", "10", "5", "5", "5", "5", "5"];
  var plan_template;

  var plan_value = function(plan) {
    var price = Number($(plan).find(".price input").val());
    var mix_decimal = Number($(plan).find(".mix-percentage input").val()) / 100;

    return price * mix_decimal;
  };

  var row_value = function($row) {
    var number_of_signups = Number($row.find(".signups input").val());
    var $plans = $row.find(".plan-column");
    var plan_values = _($plans).map(plan_value);
    var expected_signup_value = _(plan_values).reduce(function(memo, plan_value)
                                                      { return memo + plan_value; },
                                                      0);
    return number_of_signups * expected_signup_value;
  };

  var calculate_revenue_multiplier = function($application) {
    console.log("CALCULATING");
    var original_value = row_value($application.find(".original-plans"));
    var new_value = row_value($application.find(".new-plans"));

    // Rounds down to 2 decimal places
    return Math.floor(((new_value / original_value) - 1) * 100);
  };

  var clear_errors = function() {
    $(".has-error").each(function() {
      $(this).removeClass("has-error");
    });
  };

  var identify_invalid_inputs = function() {
    return _($(".application input")).reject(function(input) {
      var input_value = $(input).val();
      if ( _.isEmpty(input_value) ) {
        return false;
      } else if ( _.isNaN(Number(input_value) ) ) {
        return false;
      } else if ( Number(input_value) < 0 ) {
        return false;
      } else {
        return true;
      }
    });
  };

  var mark_inputs_with_errors = function($inputs) {
    _($inputs).each(function(input) {
      $(input).parent().addClass("has-error");
    });
  };

  var total_up_percentages = function($percentages) {
    return _($percentages).reduce(function(memo, percentage_DOM) {
      return memo + Number($(percentage_DOM).val());
    }, 0);
  };

  $("button.calculate-multiplier").on("click", function() {
    console.log("YOU CLICKED THE BUTTON");
    var invalid_inputs = identify_invalid_inputs();

    clear_errors();

    if ( invalid_inputs.length !== 0 ) {
      console.log("INVALID INPUTS", invalid_inputs);
      mark_inputs_with_errors(invalid_inputs);
      $(".multiplier-display strong").html("???");
    } else {
      console.log("VALID INPUTS");
      var $original_percentages = $(".original-plans .mix-percentage input");
      var $new_percentages = $(".new-plans .mix-percentage input");
      var original_total = total_up_percentages($original_percentages);
      var new_total = total_up_percentages($new_percentages);

      if ( original_total != 100 || new_total != 100 ) {
        if ( original_total != 100 ) {
          mark_inputs_with_errors($original_percentages);
          $(".original-plans .mix-percentage-callout").addClass("has-error");
        }

        if ( new_total != 100 ) {
          mark_inputs_with_errors($new_percentages);
          $(".new-plans .mix-percentage-callout").addClass("has-error");
        }
        $(".multiplier-display strong").html("???");
      } else {
        var multiplier = calculate_revenue_multiplier($(".application"));
        $(".multiplier-display strong").html(multiplier.toString() + "% increase in New MRR");
      }
    }
  });

  $(".plans").on("click", ".add-plan", function() {
    var parent_column = $(this).parent();
    var previous_name = parent_column.prev().find(".plan-name").html();
    var plan_index = $.inArray(previous_name, plan_names);
    var new_plan_name = plan_names[plan_index + 1];
    var new_plan_price = plan_prices[plan_index + 1];
    var new_plan_percentage = mix_percentages[plan_index + 1];
    var new_plan = plan_template.clone();

    new_plan.find(".plan-name").html(new_plan_name);
    new_plan.find(".price input").attr("placeholder", new_plan_price);
    new_plan.find(".mix-percentage input").attr("placeholder", new_plan_percentage);

    parent_column.before(new_plan);

    if ( parent_column.siblings().length == 6 ) {
      parent_column.hide();
    } else {
      //do nothing
    }
  });

  $(".application").on("click", ".close-button", function() {
    var parent_column = $(this).parents(".plan-column");
    var siblings = parent_column.siblings();

    parent_column.remove();

    if ( siblings.length == 6 ) {
      siblings.last().show();
    } else {
      //do nothing
    }
  });

  $(".new-plans-header button.copy-plans").on("click", function() {
    var cloned_columns = $(".original-plans > .col-xs-2").clone();
    $(".new-plans").html(cloned_columns);
  });

  // This highlights input values on click. Easier for the user to change them repeatedly.
  $(".application").on("click", "input", function () {
    $(this).select();
  });

  $(document).ready(function() {
    plan_template = $(".plan-column:first").clone();
    plan_template.find("[placeholder]").removeAttr("placeholder");
  });

})();

