/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Thomas Herchenroeder (thron7)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************

#module(testrunner)
#resource(css:css)
#resource(image:image)

#embed(qx.icontheme/16/*)
#embed(testrunner.image/*)
#embed(testrunner.css/*)

************************************************************************ */

/**
 * The main application class.
 */
qx.Class.define("testrunner.runner.Application",
{
  extend : qx.application.Gui,



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    main : function()
    {
      this.base(arguments);

      // Define alias for custom resource path
      qx.io.Alias.getInstance().add("testrunner", qx.core.Setting.get("testrunner.resourceUri"));

      // Include CSS file
      qx.html.StyleSheet.includeFile(qx.io.Alias.getInstance().resolve("testrunner/css/testrunner.css"));

      // Initialize the viewer
      this.viewer = new testrunner.runner.TestRunner;

      // this.viewer = new testrunner.runner.BasicRunner;
      this.viewer.addToDocument();
    }
  },



  /*
  *****************************************************************************
     SETTINGS
  *****************************************************************************
  */

  settings : {
    "testrunner.resourceUri" : "./resource"
  }
});
