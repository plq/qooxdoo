/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2012 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Author:
     * Daniel Wagner (danielwagner)

************************************************************************ */

/* ************************************************************************
#ignore(require)
************************************************************************ */

/**
 * Loads the WebDriverJs module and exposes it as simulator.webdriver
 * @lint ignoreUndefined(require)
 */
qx.Class.define("simulator.qxwebdriver.WebDriver", {

  statics :
  {
    /**
     * Returns a WebElement representing a qooxdoo widget.
     * In addition to the standard WebElement methods, interaction
     * methods specific to the interfaces implemented by the widget
     * will be available, e.g. {@link simulator.webdriver.interactions.Form.selectItem}
     * for qx.ui.form.SelectBox or widgets inheriting from it.
     *
     * @param locator {webdriver.Locator} locator strategy to search for a widget's
     * DOM element
     * @return {webdriver.WebElement} WebElement object
     */
    findWidget : function(locator)
    {
      var driver = this;
      var app = simulator.webdriver.promise.Application.getInstance();
      return app.schedule("findQxWidget", function() {
        return driver.findElement(locator)
        .then(function(element) {
          return driver.addQxBehavior(element);
        });
      });
    },


    waitForElementNotPresent : function(locator, timeout)
    {
      var condition = function() {
        return this.findElement(locator)
        .then(function(el) {
          return false;
        },
        function(error) {
          return true;
        });
      };

      return this.wait(condition, timeout);
    },

    /**
     * Adds widget-specific interactions to a WebElement
     *
     * @param element {webdriver.WebElement} WebElement representing a
     * qooxdoo widget's DOM element
     */
    addQxBehavior : function(element)
    {
      var driver = this;
      return driver.executeScript(simulator.qxwebdriver.Util.getInterfacesByElement, element)
      .then(function(iFaces) {
        driver.executeScript(simulator.qxwebdriver.Util.getClassHierarchy, element)
        .then(function(hierarchy) {
          hierarchy.reverse();
          iFaces = hierarchy.concat(iFaces);
          simulator.qxwebdriver.Util.addInteractions(iFaces, element);
        });

        // Store the widget's qx object registry id
        var script = "return qx.ui.core.Widget.getWidgetByElement(arguments[0]).toHashCode()";
        return driver.executeScript(script, element)
        .then(function(hash) {
          element.qxHash = hash;
          return element;
        });
      });
    },

    /**
     * Wait until the qooxdoo application under test is initialized
     * @param timeout {Integer?} Optional amount of time to wait in ms. Default:
     * {@link #AUT_LOAD_TIMEOUT}
     * @return {webdriver.promise.Promise} A promise that will be resolved when
     * the qx application is ready
     */
    waitForQxApplication : function(timeout)
    {
      var driver = this;
      var ready = false;
      return driver.wait(function() {
        driver.executeScript('return !!qx.core.Init.getApplication()')
        .then(function(ret) {
          ready = ret;
        });
        return ready;
      }, timeout || simulator.qxwebdriver.WebDriver.AUT_LOAD_TIMEOUT);
    },

    /**
     * Opens the given URL in the browser, waits until the qooxdoo application
     * to finish loading and initializes the AUT-side helpers.
     * @param url {String} The AUT's URL
     * @param timeout {Integer?} Optional timeout value for {@link #waitForQxApplication}
     * @return {webdriver.promise.Promise} A promise that will be resolved when
     * the environment is ready for testing.
     */
    getQx : function(url, timeout)
    {
      //var driver = this;
      this.get(url);
      this.init();
      return this.waitForQxApplication(timeout);
    },

    /**
     * Initialize this simulator.qxwebdriver instance
     *
     * @return {webdriver.promise.Promise} At promise that will be resolved
     * when initialization is done
     */
    init : function()
    {
      return this.defineFunction(simulator.qxwebdriver.Util.toSafeValue, "toSafeValue");
    },

    /**
     * Defines a JavaScript function that will be available in the AUT's
     * context. See the documentation of webdriver.WebDriver.executeScript
     * for details on capabilities and limitations.
     *
     * Use {@link #executeFunction} to call the function.
     *
     * @param func {Function} Function object
     * @param name {String} function name
     * @return {webdriver.promise.Promise} A promise that will be resolved
     * when the function has been defined
     */
    defineFunction : function(func, name)
    {
      var script = 'if (!window.qxwebdriver) { window.qxwebdriver = {}; }' +
        'if (!window.qxwebdriver.util) { window.qxwebdriver.util = {}; }' +
        'window.qxwebdriver.util["' + name + '"] = ' + func;
      return this.executeScript(script);
    },

    /**
     * Executes a function defined by {@link #defineFunction}.
     *
     * @param name {String} The function's name
     * @param args {Array} Array of arguments for the function
     * @return {webdriver.promise.Promise} A promise that will resolve to
     * the function call's return value
     */
    executeFunction : function(name, args)
    {
      var script = 'return window.qxwebdriver.util["' + name + '"]' +
        '.apply(window, arguments[0])';
      return this.executeScript(script, args);
    }
  },

  defer : function(statics)
  {
    simulator.webdriver = require("selenium-webdriverjs");
    for (var prop in statics) {
      if (typeof statics[prop] == "function") {
        simulator.webdriver.WebDriver.prototype[prop] = statics[prop];
      }
    }
  }
});
