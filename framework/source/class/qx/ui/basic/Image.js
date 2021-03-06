/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)
     * Sebastian Werner (wpbasti)

************************************************************************ */

/**
 * The image class displays an image file
 *
 * This class supports image clipping, which means that multiple images can be combined
 * into one large image and only the relevant part is shown.
 *
 * *Example*
 *
 * Here is a little example of how to use the widget.
 *
 * <pre class='javascript'>
 *   var image = new qx.ui.basic.Image("icon/32/actions/format-justify-left.png");
 *
 *   this.getRoot().add(image);
 * </pre>
 *
 * This example create a widget to display the image
 * <code>icon/32/actions/format-justify-left.png</code>.
 *
 * *External Documentation*
 *
 * <a href='http://manual.qooxdoo.org/${qxversion}/pages/widget/image.html' target='_blank'>
 * Documentation of this widget in the qooxdoo manual.</a>
 */
qx.Class.define("qx.ui.basic.Image",
{
  extend : qx.ui.core.Widget,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param source {String?null} The URL of the image to display.
   */
  construct : function(source)
  {
    this.__contentElements = {};

    this.base(arguments);

    if (source) {
      this.setSource(source);
    }
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /** The URL of the image */
    source :
    {
      check : "String",
      init : null,
      nullable : true,
      event : "changeSource",
      apply : "_applySource",
      themeable : true
    },


    /**
     * Whether the image should be scaled to the given dimensions
     *
     * This is disabled by default because it prevents the usage
     * of image clipping when enabled.
     */
    scale :
    {
      check : "Boolean",
      init : false,
      themeable : true,
      apply : "_applyScale"
    },


    // overridden
    appearance :
    {
      refine : true,
      init : "image"
    },


    // overridden
    allowShrinkX :
    {
      refine : true,
      init : false
    },


    // overridden
    allowShrinkY :
    {
      refine : true,
      init : false
    },


    // overridden
    allowGrowX :
    {
      refine : true,
      init : false
    },


    // overridden
    allowGrowY :
    {
      refine : true,
      init : false
    }
  },


  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events :
  {
    /**
     * Fired if the image source can not be loaded.
     *
     * *Attention*: This event is only used for images which are loaded externally
     * (aka unmanaged images).
     */
    loadingFailed : "qx.event.type.Event",


    /**
     * Fired if the image has been loaded.
     *
     * *Attention*: This event is only used for images which are loaded externally
     * (aka unmanaged images).
     */
    loaded : "qx.event.type.Event"
  },



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __width : null,
    __height : null,
    __mode : null,
    __contentElements : null,
    __currentContentElement : null,
    __wrapper : null,


    //overridden
    _onChangeTheme : function() {
      this.base(arguments);
      // restyle source (theme change might have changed the resolved url)
      this._styleSource();
    },

    /*
    ---------------------------------------------------------------------------
      WIDGET API
    ---------------------------------------------------------------------------
    */

    // overridden
    getContentElement : function() {
      return this.__getSuitableContentElement();
    },


    // overridden
    _createContentElement : function() {
      return this.__getSuitableContentElement();
    },


    // overridden
    _getContentHint : function()
    {
      return {
        width : this.__width || 0,
        height : this.__height || 0
      };
    },

    // overridden
    _applyDecorator : function(value, old) {
      this.base(arguments, value, old);

      var source = this.getSource();
      source = qx.util.AliasManager.getInstance().resolve(source);
      var el = this.getContentElement();
      if (this.__wrapper) {
        el = el.getChild(0);
      }
      this.__setSource(el, source);
    },


    // overridden
    _applyPadding : function(value, old, name)
    {
      this.base(arguments, value, old, name);

      var element = this.getContentElement();
      if (this.__wrapper) {
        element.getChild(0).setStyles({
          top: this.getPaddingTop() || 0,
          left: this.getPaddingLeft() || 0
        });
      } else {
        element.setPadding(
          this.getPaddingLeft() || 0, this.getPaddingTop() || 0
        );
      }

    },

    renderLayout : function(left, top, width, height) {
      this.base(arguments, left, top, width, height);

      var element = this.getContentElement();
      if (this.__wrapper) {
        element.getChild(0).setStyles({
          width: width - (this.getPaddingLeft() || 0) - (this.getPaddingRight() || 0),
          height: height - (this.getPaddingTop() || 0) - (this.getPaddingBottom() || 0),
          top: this.getPaddingTop() || 0,
          left: this.getPaddingLeft() || 0
        });
      }
    },




    /*
    ---------------------------------------------------------------------------
      IMAGE API
    ---------------------------------------------------------------------------
    */

    // property apply, overridden
    _applyEnabled : function(value, old)
    {
      this.base(arguments, value, old);

      if (this.getSource()) {
        this._styleSource();
      }
    },


    // property apply
    _applySource : function(value) {
      this._styleSource();
    },


    // property apply
    _applyScale : function(value) {
      this._styleSource();
    },


    /**
     * Remembers the mode to keep track which contentElement is currently in use.
     * @param mode {String} internal mode (alphaScaled|scaled|nonScaled)
     */
    __setMode : function(mode) {
      this.__mode = mode;
    },


    /**
     * Returns the current mode if set. Otherwise checks the current source and
     * the current scaling to determine the current mode.
     *
     * @return {String} current internal mode
     */
    __getMode : function()
    {
      if (this.__mode == null)
      {
        var source = this.getSource();
        var isPng = false;
        if (source != null) {
          isPng = qx.lang.String.endsWith(source, ".png");
        }

        if (this.getScale() && isPng && qx.core.Environment.get("css.alphaimageloaderneeded")) {
          this.__mode = "alphaScaled";
        } else if (this.getScale()) {
          this.__mode = "scaled";
        } else {
          this.__mode = "nonScaled";
        }
      }

      return this.__mode;
    },


    /**
     * Creates a contentElement suitable for the current mode
     *
     * @param mode {String} internal mode
     * @return {qx.html.Image} suitable image content element
     */
    __createSuitableContentElement : function(mode)
    {
      var scale;
      var tagName;
      if (mode == "alphaScaled")
      {
        scale = true;
        tagName = "div";
      }
      else if (mode == "nonScaled")
      {
        scale = false;
        tagName = "div";
      }
      else
      {
        scale = true;
        tagName = "img";
      }

      var element = new qx.html.Image(tagName);
      element.setAttribute("$$widget", this.toHashCode());
      element.setScale(scale);
      element.setStyles({
        "overflowX": "hidden",
        "overflowY": "hidden",
        "boxSizing": "border-box"
      });

      if (qx.core.Environment.get("css.alphaimageloaderneeded")) {
        var wrapper = this.__wrapper = new qx.html.Element("div");
        wrapper.setAttribute("$$widget", this.toHashCode());
        wrapper.setStyle("position", "absolute");
        wrapper.add(element);
        return wrapper;
      }

      return element;
    },


    /**
     * Returns a contentElement suitable for the current mode
     *
     * @return {qx.html.Image} suitable image contentElement
     */
    __getSuitableContentElement : function()
    {
      if (this.$$disposed) {
        return null;
      }

      var mode = this.__getMode();

      if (this.__contentElements[mode] == null) {
        this.__contentElements[mode] = this.__createSuitableContentElement(mode);
      }

      var element = this.__contentElements[mode];

      if (!this.__currentContentElement) {
        this.__currentContentElement = element;
      }

      return element;
    },


    /**
     * Applies the source to the clipped image instance or preload
     * an image to detect sizes and apply it afterwards.
     *
     */
    _styleSource : function()
    {
      var source = qx.util.AliasManager.getInstance().resolve(this.getSource());

      var element = this.getContentElement();
      if (this.__wrapper) {
        element = element.getChild(0);
      }

      if (!source)
      {
        element.resetSource();
        return;
      }

      this.__checkForContentElementSwitch(source);

      if ((qx.core.Environment.get("engine.name") == "mshtml") &&
        (parseInt(qx.core.Environment.get("engine.version"), 10) < 9 ||
         qx.core.Environment.get("browser.documentmode") < 9))
      {
        var repeat = this.getScale() ? "scale" : "no-repeat";
        element.tagNameHint = qx.bom.element.Decoration.getTagName(repeat, source);
      }

      var contentEl = this.__currentContentElement;
      if (this.__wrapper) {
        contentEl = contentEl.getChild(0);
      }

      // Detect if the image registry knows this image
      if (qx.util.ResourceManager.getInstance().has(source)) {
        this.__setManagedImage(contentEl, source);
      } else if (qx.io.ImageLoader.isLoaded(source)) {
        this.__setUnmanagedImage(contentEl, source);
      } else {
        this.__loadUnmanagedImage(contentEl, source);
      }
    },


    /**
     * Checks if the current content element is capable to display the image
     * with the current settings (scaling, alpha PNG)
     *
     * @param source {String} source of the image
     */
    __checkForContentElementSwitch : qx.core.Environment.select("engine.name",
    {
      "mshtml" : function(source)
      {
        var alphaImageLoader = qx.core.Environment.get("css.alphaimageloaderneeded");
        var isPng = qx.lang.String.endsWith(source, ".png");

        if (alphaImageLoader && isPng)
        {
          if (this.getScale() && this.__getMode() != "alphaScaled") {
            this.__setMode("alphaScaled");
          } else if (!this.getScale() && this.__getMode() != "nonScaled") {
            this.__setMode("nonScaled");
          }
        }
        else
        {
          if (this.getScale() && this.__getMode() != "scaled") {
            this.__setMode("scaled");
          } else if (!this.getScale() && this.__getMode() != "nonScaled") {
            this.__setMode("nonScaled");
          }
        }

        this.__checkForContentElementReplacement(this.__getSuitableContentElement());
      },

      "default" : function(source)
      {
        if (this.getScale() && this.__getMode() != "scaled") {
          this.__setMode("scaled");
        } else if (!this.getScale() && this.__getMode("nonScaled")) {
          this.__setMode("nonScaled");
        }

        this.__checkForContentElementReplacement(this.__getSuitableContentElement());
      }
    }),


    /**
     * Checks the current child and replaces it if necessary
     *
     * @param elementToAdd {qx.html.Image} content element to add
     */
    __checkForContentElementReplacement : function(elementToAdd)
    {
      var currentContentElement = this.__currentContentElement;

      if (currentContentElement != elementToAdd)
      {
        if (currentContentElement != null)
        {
          var pixel = "px";
          var styles = {};

          // Copy dimension and location of the current content element
          var bounds = this.getBounds();
          if (bounds != null)
          {
            styles.width = bounds.width + pixel;
            styles.height = bounds.height + pixel;
          }

          var insets = this.getInsets();
          styles.left = parseInt(currentContentElement.getStyle("left") || insets.left) + pixel;
          styles.top = parseInt(currentContentElement.getStyle("top") || insets.top) + pixel;

          styles.zIndex = 10;

          var newEl = this.__wrapper ? elementToAdd.getChild(0) : elementToAdd;
          newEl.setStyles(styles, true);
          newEl.setSelectable(this.getSelectable());

          if (!currentContentElement.isVisible()) {
            elementToAdd.hide();
          }

          if (!currentContentElement.isIncluded()) {
            elementToAdd.exclude();
          }

          var container = currentContentElement.getParent();

          if (container) {
            var index = container.getChildren().indexOf(currentContentElement);
            container.removeAt(index);
            container.addAt(elementToAdd, index);
          }
          // force re-application of source so __setSource is called again
          var hint = newEl.getNodeName();
          newEl.setSource(null);
          var currentEl = this.__wrapper ? this.__currentContentElement.getChild(0) : this.__currentContentElement;
          newEl.tagNameHint = hint;
          newEl.setAttribute("class", currentEl.getAttribute("class"));

          // Flush elements to make sure the DOM elements are created.
          qx.html.Element.flush();
          var currentDomEl = currentEl.getDomElement();
          var newDomEl = elementToAdd.getDomElement();

          // copy event listeners
          var listeners = currentContentElement.getListeners() || [];
          listeners.forEach(function(listenerData) {
            elementToAdd.addListener(listenerData.type, listenerData.handler, listenerData.self, listenerData.capture);
          });

          if (currentDomEl && newDomEl) {
            // Switch the DOM elements' hash codes. This is required for the event
            // layer to work [BUG #7447]
            var currentHash = currentDomEl.$$hash;
            currentDomEl.$$hash = newDomEl.$$hash;
            newDomEl.$$hash = currentHash;
          }

          this.__currentContentElement = elementToAdd;
        }
      }
    },


    /**
     * Use the ResourceManager to set a managed image
     *
     * @param el {Element} image DOM element
     * @param source {String} source path
     */
    __setManagedImage : function(el, source)
    {
      var ResourceManager = qx.util.ResourceManager.getInstance();

      // Try to find a disabled image in registry
      if (!this.getEnabled())
      {
        var disabled = source.replace(/\.([a-z]+)$/, "-disabled.$1");
        if (ResourceManager.has(disabled))
        {
          source = disabled;
          this.addState("replacement");
        }
        else
        {
          this.removeState("replacement");
        }
      }

      // Optimize case for enabled changes when no disabled image was found
      if (el.getSource() === source) {
        return;
      }

      // Apply source
      this.__setSource(el, source);

      // Compare with old sizes and relayout if necessary
      this.__updateContentHint(ResourceManager.getImageWidth(source),
        ResourceManager.getImageHeight(source));
    },


    /**
     * Use the infos of the ImageLoader to set an unmanaged image
     *
     * @param el {Element} image DOM element
     * @param source {String} source path
     */
    __setUnmanagedImage : function(el, source)
    {
      var ImageLoader = qx.io.ImageLoader;

      // Apply source
      this.__setSource(el, source);

      // Compare with old sizes and relayout if necessary
      var width = ImageLoader.getWidth(source);
      var height = ImageLoader.getHeight(source);
      this.__updateContentHint(width, height);
    },


    /**
     * Use the ImageLoader to load an unmanaged image
     *
     * @param el {Element} image DOM element
     * @param source {String} source path
     */
    __loadUnmanagedImage : function(el, source)
    {
      var ImageLoader = qx.io.ImageLoader;

      if (qx.core.Environment.get("qx.debug"))
      {
        // loading external images via HTTP/HTTPS is a common usecase, as is
        // using data URLs.
        var sourceLC = source.toLowerCase();
        var startsWith = qx.lang.String.startsWith;
        if (!startsWith(sourceLC, "http") &&
            !startsWith(sourceLC, "data:image/"))
        {
          var self = this.self(arguments);

          if (!self.__warned) {
            self.__warned = {};
          }

          if (!self.__warned[source])
          {
            this.debug("try to load an unmanaged relative image: " + source);
            self.__warned[source] = true;
          }
        }
      }

      // only try to load the image if it not already failed
      if(!ImageLoader.isFailed(source)) {
        ImageLoader.load(source, this.__loaderCallback, this);
      } else {
        if (el != null) {
          el.resetSource();
        }
      }
    },


    /**
     * Combines the decorator's image styles with our own image to make sure
     * gradient and backgroundImage decorators work on Images.
     *
     * @param el {Element} image DOM element
     * @param source {String} source path
     */
    __setSource : function(el, source) {
      if (el.getNodeName() == "div") {

        var dec = qx.theme.manager.Decoration.getInstance().resolve(this.getDecorator());
        // if the decorator defines any CSS background-image
        if (dec) {
          var hasGradient = (dec.getStartColor() && dec.getEndColor());
          var hasBackground = dec.getBackgroundImage();
          if (hasGradient || hasBackground) {
            var repeat = this.getScale() ? "scale" : "no-repeat";

            // get the style attributes for the given source
            var attr = qx.bom.element.Decoration.getAttributes(source, repeat);
            // get the background image(s) defined by the decorator
            var decStyle = dec.getStyles(true);

            var combinedStyles = {
              "backgroundImage":  attr.style.backgroundImage,
              "backgroundPosition": (attr.style.backgroundPosition || "0 0"),
              "backgroundRepeat": (attr.style.backgroundRepeat || "no-repeat")
            };

            if (hasBackground) {
              combinedStyles["backgroundPosition"] += "," + decStyle["background-position"] || "0 0";
              combinedStyles["backgroundRepeat"] += ", " + dec.getBackgroundRepeat();
            }

            if (hasGradient) {
              combinedStyles["backgroundPosition"] += ", 0 0";
              combinedStyles["backgroundRepeat"] += ", no-repeat";
            }

            combinedStyles["backgroundImage"] += "," + decStyle["background-image"];

            // apply combined background images
            el.setStyles(combinedStyles);

            return;
          }
        } else {
          // force re-apply to remove old decorator styles
          el.setSource(null);
        }
      }

      el.setSource(source);
    },


    /**
     * Event handler fired after the preloader has finished loading the icon
     *
     * @param source {String} Image source which was loaded
     * @param imageInfo {Map} Dimensions of the loaded image
     */
    __loaderCallback : function(source, imageInfo)
    {
      // Ignore the callback on already disposed images
      if (this.$$disposed === true) {
        return;
      }

      // Ignore when the source has already been modified
      if (source !== qx.util.AliasManager.getInstance().resolve(this.getSource())) {
        return;
      }

      // Output a warning if the image could not loaded and quit
      if (imageInfo.failed) {
        this.warn("Image could not be loaded: " + source);
        this.fireEvent("loadingFailed");
      } else if (imageInfo.aborted) {
        // ignore the rest because it is aborted
        return;
      } else {
        this.fireEvent("loaded");
      }

      // Update image (again)
      this._styleSource();
    },


    /**
     * Updates the content hint when the image size has been changed
     *
     * @param width {Integer} width of the image
     * @param height {Integer} height of the image
     */
    __updateContentHint : function(width, height)
    {
      // Compare with old sizes and relayout if necessary
      if (width !== this.__width || height !== this.__height)
      {
        this.__width = width;
        this.__height = height;

        qx.ui.core.queue.Layout.add(this);
      }
    }
  },


  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    delete this.__currentContentElement;
    this._disposeMap("__contentElements");
  }
});
