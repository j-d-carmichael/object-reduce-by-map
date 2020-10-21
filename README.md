# object-reduce-by-map
Recursively reduce an object to match a given map.

[![Build Status](https://travis-ci.org/johndcarmichael/object-reduce-by-map.svg?branch=master)](https://travis-ci.org/johndcarmichael/object-reduce-by-map) | [![Dependencies](https://david-dm.org/johndcarmichael/object-reduce-by-map.svg)](https://david-dm.org/johndcarmichael/object-reduce-by-map) | [![License](http://img.shields.io/npm/l/object-reduce-by-map.svg)](https://github.com/johndcarmichael/object-reduce-by-map/blob/master/LICENSE)

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Features](#features)
- [Breaking changes 1 -> 2](#breaking-changes-1---2)
- [Example use as an API output transformer](#example-use-as-an-api-output-transformer)
- [Example usages](#example-usages)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Features
 - Reduce a given object to match the structure and leaf data types of a given map
 - Delete non-matching input nodes
 - Optionally throw an error for non-matching nodes with throwErrorOnAlien
 - Provide options:
   -  keepKeys: Retain mismatched keys as null opposed to deleting them 
   -  throwErrorOnAlien: Throw error on alien found

## Breaking changes 1 -> 2
In version 1 a bug was discovered that permitted alien keys of null value into the output. This has now been resolved however may cause any tools using this helper tool to break, hence the major version bump.

## Example use as an API output transformer
An example use case of this package can be found in the TypeScript openapi-nodegen templates as an output transformer: [openapi-nodegen-typescript-server](https://github.com/acrontum/openapi-nodegen-typescript-server/blob/master/src/http/nodegen/routes/___op.ts.njk#L31)

## Example usages
The most up to date examples can always be [found in the tests](https://github.com/johndcarmichael/object-reduce-by-map/tree/master/__tests__)