import preact from "preact";
/**
 * Removes `-` fron a string and capetalize the letter after
 * example: data-props-hello-world =>  dataPropsHelloWorld
 * Used for props passed from host DOM element
 * @param  {String} str string
 * @return {String} Capetalized string
 */
const camelcasize = str => {
  return str.replace(/-([a-z])/gi, (all, letter) => {
    return letter.toUpperCase();
  });
};

/**
 * [getExecutedScript internal widget to provide the currently executed script]
 * @param  {document} document [Browser document object]
 * @return {HTMLElement}     [script Element]
 */
const getExecutedScript = () => {
  return (
    document.currentScript ||
    (() => {
      let scripts = document.getElementsByTagName("script");
      return scripts[scripts.length - 1];
    })()
  );
};

/**
 * Get the props from a host element's data attributes
 * @param  {Element} tag The host element
 * @return {Object}  props object to be passed to the component
 */
const collectPropsFromElement = element => {
  let attrs = element.attributes;
  let props = {};

  // ceck for another props attached to the element
  Object.keys(attrs).forEach(key => {
    if (attrs.hasOwnProperty(key)) {
      let dataAttrName = attrs[key].name;
      if (!dataAttrName || typeof dataAttrName !== "string") {
        return false;
      }
      let propName = dataAttrName.split(/(data-props?-)/).pop();
      propName = camelcasize(propName);
      if (dataAttrName !== propName) {
        let propValue = attrs[key].nodeValue;
        props[propName] = propValue;
      }
    }
  });
  return props;
};

const getHabitatSelectorFromClient = (currentScript) => {
  let scriptTagAttrs = currentScript.attributes;
  let selector = null;
  // ceck for another props attached to the tag
  Object.keys(scriptTagAttrs).forEach(key => {
    if (scriptTagAttrs.hasOwnProperty(key)) {
      const dataAttrName = scriptTagAttrs[key].name;
      if (dataAttrName === 'data-mount-in') {
        selector = scriptTagAttrs[key].nodeValue;
      }
    }
  });
  return selector
}

/**
 * Return array of 0 or more elements that will host our widget
 * @param  {id} attrId the data widget id attribute the host should have
 * @param  {document} scope  Docuemnt object or DOM Element as a scope
 * @return {Array}        Array of matching habitats
 */
const widgetDOMHostElements = (
  selector = null,
  { inline = false, clientSpecified = false, clean = false } = {}
) => {
  let hostNodes = [];
  let currentScript = getExecutedScript();

  if (inline === true) {
    let parentNode = currentScript.parentNode;
    if (clean) node.innerHTML = "";
    hostNodes.push(parentNode);
  }

  if (clientSpecified === true && !selector) {
    // user did not specify where to mount - get it from script tag attributes
    selector = `[data-widget='${getHabitatSelectorFromClient(currentScript)}']`
  }
  if (selector) {
    [].forEach.call(document.querySelectorAll(selector), queriedTag => {
      if (clean) queriedTag.innerHTML = "";
      hostNodes.push(queriedTag);
    });
  }
  return hostNodes;
};

/**
 * private _render function that will be queued if the DOM is not render
 * and executed immeidatly if DOM is ready
 */
let _render = (widget, hostElements, root) => {
  hostElements.forEach(elm => {
    let hostNode = elm;
    let props = collectPropsFromElement(elm) || {};
    return preact.render(preact.h(widget, props), hostNode, root);
  });
};

export {
  collectPropsFromElement,
  widgetDOMHostElements,
  getExecutedScript,
  camelcasize,
  _render,
  getHabitatSelectorFromClient
};
