'use strict';

let TextRepresentation = require('./ElementRepresentations').TextRepresentation,
    OuterHTMLRepresentation = require('./ElementRepresentations').OuterHTMLRepresentation,
    AttributeRepresentation = require('./ElementRepresentations').AttributeRepresentation;

function SimpleSelector(selector) {
    this.orig = selector;
    this.selector = selector;
    this.attribute = '';
    this.excludes = [];
    this.index = -1;
    this.representation = TextRepresentation;
}

function ComplexSelector(simple_selector) {
    if (simple_selector) {
        this.build(simple_selector);
    }
}

ComplexSelector.prototype.build = function(simple_selector) {
    this.selectors = [];

    let selectors = simple_selector.split(',');

    for (let selector of selectors) {
        let result = new SimpleSelector(selector);

        let eq_matches = result.selector.match(/:eq\((\d+)\)/);
        if (eq_matches && eq_matches.length > 1) {
            result.index = parseInt(eq_matches[1]);
            result.selector = result.selector.replace(/:eq\((\d+)\)/, '');
        }

        result.selector = result.selector.replace(/:exclude\((.+?)\)/g, function(_, exclude_selector) {
            result.excludes.push(exclude_selector);
            return '';
        });

        let sel_attr_list = result.selector.match(/(.*?)\[([a-zA-Z\-]+)\]/);
        if (sel_attr_list) {
            result.selector = sel_attr_list[1];
            result.attribute = sel_attr_list[2];
        }

        if (result.attribute) {
            switch(result.attribute) {
            case 'outerHTML':
                result.representation = OuterHTMLRepresentation;
                break;
            case 'text':
                result.representation = TextRepresentation;
                break;
            default:
                result.representation = AttributeRepresentation;
            }
        }

        this.selectors.push(result);
    }
};

ComplexSelector.prototype.apply_on_element = function($, element) {
    let result = [];
    for (let sel of this.selectors) {
        let repr = new sel.representation($, element, sel);
        result.push(repr.repr());
    }
    return result;
};

module.exports = ComplexSelector;
