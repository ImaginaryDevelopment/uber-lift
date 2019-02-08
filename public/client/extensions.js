"use strict";
// export module Extensions{
var findJsParent = () => ((typeof module !== "undefined" && module && module.exports
    || typeof module !== "undefined" && module)
    || typeof global !== "undefined" && global
    || typeof window !== "undefined" && window);