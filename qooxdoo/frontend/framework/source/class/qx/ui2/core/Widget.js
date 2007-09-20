/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("qx.ui2.core.Widget",
{
  extend : qx.core.Object,
  
  
  
  
  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */
    
  construct : function()
  {
    this.base(arguments);
    
    this._children = [];
    this._outerElement = new qx.html.Element;
    this._innerElement = new qx.html.Element;
    
  },
  
  
  
  
  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */
    
  events :
  {
    
    
  },
  
    
  
  
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */
    
  statics : 
  {
    
    
  },
  
  
  
  
  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */
    
  members : 
  {
    /*
    ---------------------------------------------------------------------------
      CHILDREN MANAGEMENT
    ---------------------------------------------------------------------------
    */

    
    
    
    
    
    
    
    
    
    
    
    
  },
  
  
  
  
  /*
  *****************************************************************************
     DESTRUCT
  *****************************************************************************
  */
    
  destruct : function()
  {
    
    
  }
});
