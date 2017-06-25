/****************************************************************************
 The MIT License (MIT)

 Copyright (c) 2014 Apigee Corporation

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/
'use strict';

var fs = require('fs');
var yaml = require('js-yaml');
var a127Config = require('./config');
var util = require('util');
var split = require('splitargs');
var _ = require('lodash');

module.exports = {
  load: load
};

var cached = {};

function load(file, config) {

  if (!config) { config = a127Config.load();}
  if (!file) { file = config['a127.magic'].swaggerFile; }

  if (!_.isEqual(cached.config, config) || cached.file !== file || !cached.yaml) {
    cached.config = config;
    cached.file = file;

    var sourceString = fs.readFileSync(file, 'utf8');
    var sourceLines = sourceString.split('\n');
    verify(sourceLines);
    var replacementString = doConfigReplacements(sourceLines, config);
    cached.yaml = yaml.safeLoad(replacementString);
  }

  return cached.yaml;
}

function verify(sourceLines) {
  ['x-a127-services','x-volos-resources'].forEach(function(category) {
    var sectionFilter = new SectionFilter(category + ':');
    var names = {};
    var indent;
    sourceLines.filter(sectionFilter).forEach(function(line) {
      var name = line.trim().split(' ')[0];
      if (name.length === 0) { return; }
      if (!indent) { indent = line.indexOf(name) } // set the expected indent for keys
      if (line.indexOf(name) !== indent) { return; }
      if (names[name]) {
        var nameNoColon = name.substring(0, name.length - 1);
        throw new Error(util.format('duplicate resource named: %s in: %s', nameNoColon, category));
      }
      names[name] = true;
    });
  });
}

function doConfigReplacements(sourceLines, config) {
  var returnLines = [];
  var sectionFilter = new SectionFilter('x-a127-config:');
  var anchorIndent;
  sourceLines.forEach(function(line) {
    if (sectionFilter(line)) {
      var tokens = split(line);
      var indent = line.indexOf(tokens[0]);
      if (anchorIndent) { // we're inside a tag
        if (indent <= anchorIndent) { anchorIndent = null; }
      }
      if (!anchorIndent) { // start a tag?
        var anchor = getAnchor(tokens);
        if (anchor) {
          var key = tokens[0].slice(0, -1); // remove ":"
          var configValue = config[key];
          if (configValue !== undefined) { // we need to do a replacement
            anchorIndent = indent;
            var upTo = line.lastIndexOf(anchor) + anchor.length;
            var partialLine = line.slice(0, upTo); // cut off anything after the reference
            var configYaml = yaml.safeDump(configValue);
            if (typeof(configValue) === 'string' ||
              typeof(configValue) === 'boolean' ||
              typeof(configValue) === 'number') { // simple types go inline
              partialLine += ' ' + configYaml;
              line = partialLine;
            } else {
              returnLines.push(partialLine); // anything else on following lines
              var yamlLines = configYaml.split('\n');
              var spaces = Array(indent + 3).join(' ');
              for (var i = 0; i < yamlLines.length - 1; i++) { // length - 1 because last line is empty (was \n)
                returnLines.push(spaces + yamlLines[i]);
              }
              return;
            }
          }
        }
      } else {
        return;
      }
    }
    returnLines.push(line);
  });
  return returnLines.join('\n');
}

function SectionFilter(sectionKey) {
  var sectionIndent = -1;

  return function(value) {

    if (!sectionKey) { return false; }
    var trimmedValue = value.trim();
    if (trimmedValue.length === 0) { return false; } // ignore blank lines
    if (trimmedValue.charAt(0) === '#') { return false; } // ignore comments

    if (sectionIndent >= 0) {
      if (value.indexOf(trimmedValue) <= sectionIndent) { // we're out of the section
        sectionKey = null;
      } else {
        return true;
      }
    } else {
      sectionIndent = value.indexOf(sectionKey);
    }
    return false;
  }
}

function getAnchor(tokens) {
  for (var i = tokens.length - 1; i > 0; i--) {
    if (tokens[i][0] === '&') { return tokens[i]; }
  }
  return undefined;
}
