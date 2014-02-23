DocumentSupport = require('./documentSupport')

class GherkinDocument extends DocumentSupport
  constructor: (@name) ->
    super "feature", @name

  stub: -> """
Feature: #{@name}

  Scenario:
    Given
    When
    Then

"""

module.exports = GherkinDocument

