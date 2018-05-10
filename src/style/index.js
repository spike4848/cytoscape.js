import * as is from '../is';
import * as util from '../util';
import Selector from '../selector';

import apply from './apply';
import bypass from './bypass';
import container from './container';
import getForEle from './get-for-ele';
import json from './json';
import stringSheet from './string-sheet';
import properties from './properties';
import parse from './parse';

let Style = function( cy ){

  if( !(this instanceof Style) ){
    return new Style( cy );
  }

  if( !is.core( cy ) ){
    util.error( 'A style must have a core reference' );
    return;
  }

  this._private = {
    cy: cy,
    coreStyle: {}
  };

  this.length = 0;

  this.resetToDefault();
};

let styfn = Style.prototype;

styfn.instanceString = function(){
  return 'style';
};

// remove all contexts
styfn.clear = function(){
  for( let i = 0; i < this.length; i++ ){
    this[ i ] = undefined;
  }
  this.length = 0;

  let _p = this._private;

  _p.newStyle = true;

  return this; // chaining
};

styfn.resetToDefault = function(){
  this.clear();
  this.addDefaultStylesheet();

  return this;
};

// builds a style object for the 'core' selector
styfn.core = function(){
  return this._private.coreStyle;
};

// create a new context from the specified selector string and switch to that context
styfn.selector = function( selectorStr ){
  // 'core' is a special case and does not need a selector
  let selector = selectorStr === 'core' ? null : new Selector( selectorStr );

  let i = this.length++; // new context means new index
  this[ i ] = {
    selector: selector,
    properties: [],
    mappedProperties: [],
    index: i
  };

  return this; // chaining
};

// add one or many css rules to the current context
styfn.css = function(){
  let self = this;
  let args = arguments;

  if( args.length === 1 ){
    let map = args[0];

    for( let i = 0; i < self.properties.length; i++ ){
      let prop = self.properties[ i ];
      let mapVal = map[ prop.name ];

      if( mapVal === undefined ){
        mapVal = map[ util.dash2camel( prop.name ) ];
      }

      if( mapVal !== undefined ){
        this.cssRule( prop.name, mapVal );
      }
    }

  } else if( args.length === 2 ){
    this.cssRule( args[0], args[1] );
  }

  // do nothing if args are invalid

  return this; // chaining
};
styfn.style = styfn.css;

// add a single css rule to the current context
styfn.cssRule = function( name, value ){
  // name-value pair
  let property = this.parse( name, value );

  // add property to current context if valid
  if( property ){
    let i = this.length - 1;
    this[ i ].properties.push( property );
    this[ i ].properties[ property.name ] = property; // allow access by name as well

    if( property.name.match( /pie-(\d+)-background-size/ ) && property.value ){
      this._private.hasPie = true;
    }

    if( property.mapped ){
      this[ i ].mappedProperties.push( property );
    }

    // add to core style if necessary
    let currentSelectorIsCore = !this[ i ].selector;
    if( currentSelectorIsCore ){
      this._private.coreStyle[ property.name ] = property;
    }
  }

  return this; // chaining
};

styfn.append = function( style ){
  if( is.stylesheet( style ) ){
    style.appendToStyle( this );
  } else if( is.array( style ) ){
    this.appendFromJson( style );
  } else if( is.string( style ) ){
    this.appendFromString( style );
  } // you probably wouldn't want to append a Style, since you'd duplicate the default parts

  return this;
};

// static function
Style.fromJson = function( cy, json ){
  let style = new Style( cy );

  style.fromJson( json );

  return style;
};

Style.fromString = function( cy, string ){
  return new Style( cy ).fromString( string );
};

[
  apply,
  bypass,
  container,
  getForEle,
  json,
  stringSheet,
  properties,
  parse
].forEach( function( props ){
  util.extend( styfn, props );
} );


Style.types = styfn.types;
Style.properties = styfn.properties;
Style.propertyGroups = styfn.propertyGroups;
Style.propertyGroupNames = styfn.propertyGroupNames;
Style.propertyGroupKeys = styfn.propertyGroupKeys;

export default Style;
