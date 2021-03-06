/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Gabriel Munteanu (gabios)

************************************************************************ */

/**
 * SinglePlaceholder is a class used to render forms into a mobile page.
 * It presents a label into the placeholder of the form elements
 *
 */
qx.Class.define("qx.ui.mobile.form.renderer.SinglePlaceholder",
{

  extend : qx.ui.mobile.form.renderer.Single,

  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param form {qx.ui.mobile.form.Form} The target form of this renderer
   */
  construct : function(form)
  {
    this.base(arguments,form);
    this.addCssClass("single-placeholder");
    this.removeCssClass("single");
  },


  members :
  {

    // override
    addItems : function(items, names, title) {
      if(title != null)
      {
        this._addGroupHeader(title);
      }
      for(var i=0, l=items.length; i<l; i++)
      {
        var row = new qx.ui.mobile.form.Row(new qx.ui.mobile.layout.HBox());
        var item = items[i];
        var name = names[i];

        if(item instanceof qx.ui.mobile.form.TextArea) {
          var scrollContainer = new qx.ui.mobile.container.ScrollComposite();
          scrollContainer.setFixedHeight(true);
          scrollContainer.setShowScrollIndicator(false);
          scrollContainer.add(item, {
            flex: 1
          });

          row.add(scrollContainer, {flex:1});
        } else {
          if (item.setPlaceholder === undefined) {
            if(name !== null) {
              var label = new qx.ui.mobile.form.Label("<p>"+name+"</p>");
              label.setLabelFor(item.getId());
              row.add(label, {flex:1});
            }
            row.add(item);
          } else {
            item.setPlaceholder(name);
            row.add(item, {flex:1});
          }
        }
        this._add(row);
      }
    }

  }
});
