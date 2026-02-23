(() => {
  function matchesSearch(exp, q){
    if (!q) return true;
    return (exp.description || "").toLowerCase().includes(q.toLowerCase());
  }

  function inDateRange(exp, from, to){
    if (!from && !to) return true;
    const d = new Date(exp.date).getTime();
    if (from && d < new Date(from).getTime()) return false;
    if (to && d > new Date(to).getTime()) return false;
    return true;
  }

  function applyFilters(list, f){
    return list.filter(exp => {
      if (!matchesSearch(exp, f.search)) return false;
      if (f.payment !== "all" && exp.paymentType !== f.payment) return false;
      if (f.category !== "all" && exp.category !== f.category) return false;
      if (!inDateRange(exp, f.fromDate, f.toDate)) return false;
      return true;
    });
  }

  function applySort(list, sortBy){
    const copy = [...list];
    switch(sortBy){
      case "date_asc": copy.sort((a,b) => new Date(a.date) - new Date(b.date)); break;
      case "date_desc": copy.sort((a,b) => new Date(b.date) - new Date(a.date)); break;
      case "amount_asc": copy.sort((a,b) => a.amount - b.amount); break;
      case "amount_desc": copy.sort((a,b) => b.amount - a.amount); break;
    }
    return copy;
  }

  window.FilterService = { applyFilters, applySort };
})();