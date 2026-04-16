(function(){
  // 使用你提供的 location 文件顺序，确保下拉项与校园实际命名一致。
  const LOCATION_OPTIONS = [
    'Alumni Foundation Center',
    'Andreas Observatory',
    'Armstrong Hall',
    'Centennial Student Union',
    'Clinical Sciences Building',
    'Crawford Residence Community',
    'Earley Center for Performing Arts',
    'Ford Hall',
    'Highland Center',
    'Highland North',
    'Julia A. Sears Residence Community',
    'Maverick All-Sports Dome',
    'McElroy Residence Community',
    'Memorial Library',
    'Morris Hall',
    'Myers Field House',
    'Nelson Hall',
    'Otto Recreation Center',
    'Penington Hall',
    'Preska Residence Community',
    'Stadium Heights Residence Community',
    'Taylor Center',
    'Trafton East',
    'Trafton North',
    'Trafton South',
    'Trafton Science Center',
    'University Advancement Center',
    'Wiecking Center',
    'Wigley Administration Center',
    'Wissink Hall',
    'Lot 1',
    'Lot 2',
    'Lot 4',
    'Lot 5',
    'Lot 6',
    'Lot 7',
    'Lot 8',
    'Lot 9',
    'Lot 10',
    'Lot 11',
    'Lot 12',
    'Lot 13',
    'Lot 14',
    'Lot 15',
    'Lot 16',
    'Lot 17',
    'Lot 20',
    'Lot 21',
    'Lot 22',
    'Lot 23',
    'Other'
  ];
  const TYPE_OPTIONS = ['Shopping', 'Delivery', 'Printing'];

  function escapeAttr(value){
    return String(value || '').replace(/"/g, '&quot;');
  }

  function escapeHtml(value){
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function readSavedAddressesFromStorage(){
    try {
      if (window.AccountManager && typeof window.AccountManager.getSavedAddressOptions === 'function') {
        return window.AccountManager.getSavedAddressOptions() || [];
      }

      var currentEmail = localStorage.getItem('mavsideUserEmail') || '';
      var raw = JSON.parse(localStorage.getItem('mavsideAddresses') || '[]');
      if (Array.isArray(raw)) {
        return raw.map(function(item){
          return {
            id: item.id,
            name: item.name || 'Saved Address',
            location: item.location || '',
            isDefault: !!item.isDefault,
            label: (item.name || 'Saved Address') + (item.isDefault ? ' (Default)' : '') + ' - ' + (item.location || '')
          };
        });
      }
      if (raw && typeof raw === 'object' && currentEmail && Array.isArray(raw[currentEmail])) {
        return raw[currentEmail].map(function(item){
          return {
            id: item.id,
            name: item.name || 'Saved Address',
            location: item.location || '',
            isDefault: !!item.isDefault,
            label: (item.name || 'Saved Address') + (item.isDefault ? ' (Default)' : '') + ' - ' + (item.location || '')
          };
        });
      }
    } catch (error) {}
    return [];
  }

  function renderLocationField(config){
    const cfg = Object.assign({
      title: 'Location',
      key: 'location',
      required: false,
      options: LOCATION_OPTIONS,
      placeholder: 'Building / room / detail',
      readonly: false,
      enableSavedAddressSelect: false,
      savedAddressLabel: 'Use saved address'
    }, config || {});

    const optionsHtml = ['<option value="">Please select</option>'].concat(
      cfg.options.map(function(opt){
        return '<option value="' + escapeAttr(opt) + '">' + opt + '</option>';
      })
    ).join('');

    const savedList = cfg.enableSavedAddressSelect ? readSavedAddressesFromStorage() : [];
    const savedOptionsHtml = ['<option value="">Please select saved address</option>'].concat(
      savedList.map(function(item){
        return '<option value="' + escapeAttr(item.id) + '" data-location="' + escapeAttr(item.location) + '">' + escapeHtml(item.label || item.location || item.name || 'Saved Address') + '</option>';
      })
    ).join('');

    const savedAddressHtml = cfg.enableSavedAddressSelect
      ? '<div class="saved-address-wrap" style="display:grid;gap:6px;margin-bottom:6px;">' +
          '<label for="' + cfg.key + '-use-saved" style="display:flex;align-items:center;gap:8px;font-weight:500;">' +
            '<input id="' + cfg.key + '-use-saved" name="' + cfg.key + '-use-saved" type="checkbox">' + escapeHtml(cfg.savedAddressLabel) +
          '</label>' +
          '<select id="' + cfg.key + '-saved" name="' + cfg.key + '-saved" disabled>' + savedOptionsHtml + '</select>' +
        '</div>'
      : '';

    return '<div class="field-block location-field" data-key="' + escapeAttr(cfg.key) + '">' +
      '<label for="' + cfg.key + '-select">' + cfg.title + '</label>' +
      savedAddressHtml +
      '<div class="location-pair">' +
        '<select id="' + cfg.key + '-select" name="' + cfg.key + '-select" ' + (cfg.required ? 'required' : '') + ' ' + (cfg.readonly ? 'disabled' : '') + '>' + optionsHtml + '</select>' +
        '<input id="' + cfg.key + '-detail" name="' + cfg.key + '-detail" type="text" placeholder="' + escapeAttr(cfg.placeholder) + '" ' + (cfg.readonly ? 'readonly' : '') + '>' +
      '</div>' +
    '</div>';
  }

  function initSavedAddressPicker(key){
    const checkbox = document.getElementById(key + '-use-saved');
    const savedSelect = document.getElementById(key + '-saved');
    const locationSelect = document.getElementById(key + '-select');
    const detailInput = document.getElementById(key + '-detail');
    if(!checkbox || !savedSelect || !locationSelect || !detailInput) return;

    function syncFromSaved(){
      const useSaved = !!checkbox.checked;
      savedSelect.disabled = !useSaved;
      if(useSaved){
        locationSelect.disabled = true;
        detailInput.readOnly = true;
      } else {
        locationSelect.disabled = false;
        detailInput.readOnly = false;
      }

      if(useSaved){
        const opt = savedSelect.options[savedSelect.selectedIndex];
        const location = opt ? String(opt.getAttribute('data-location') || '').trim() : '';
        locationSelect.value = 'Other';
        detailInput.value = location;
      }
    }

    checkbox.addEventListener('change', syncFromSaved);
    savedSelect.addEventListener('change', syncFromSaved);
    syncFromSaved();
  }

  function acronym(value){
    return String(value || '')
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter(Boolean)
      .map(function(part){ return part.charAt(0); })
      .join('');
  }

  function optionMatches(optionText, query){
    if(!query) return true;
    const q = String(query || '').trim().toLowerCase();
    if(!q) return true;
    const text = String(optionText || '').toLowerCase();
    const tokens = text.split(/[^a-z0-9]+/).filter(Boolean);

    // 规则1：完整名称前缀匹配（输入前几个字）。
    if(text.indexOf(q) === 0) return true;
    // 规则2：任意单词前缀匹配（例如输入 "cent" 匹配 Centennial）。
    if(tokens.some(function(token){ return token.indexOf(q) === 0; })) return true;
    // 规则3：首字母缩写匹配（例如 "csu" 匹配 Centennial Student Union）。
    if(acronym(optionText).indexOf(q) === 0) return true;

    return false;
  }

  function fillSelectOptions(selectEl, options, preferredValue){
    if(!selectEl) return;
    const preferred = String(preferredValue || '').trim();
    const selected = preferred || String(selectEl.value || '').trim();
    const html = ['<option value="">Please select</option>']
      .concat(options.map(function(opt){
        return '<option value="' + escapeAttr(opt) + '">' + opt + '</option>';
      }))
      .join('');
    selectEl.innerHTML = html;
    if(selected && options.indexOf(selected) >= 0){
      selectEl.value = selected;
    }
  }

  function initLocationAutocomplete(key, options){
    const selectEl = document.getElementById(key + '-select');
    const detailEl = document.getElementById(key + '-detail');
    if(!selectEl || !detailEl) return;
    if(selectEl.disabled || detailEl.readOnly) return;

    const rawOptions = (Array.isArray(options) ? options : LOCATION_OPTIONS).slice();
    const hasOther = rawOptions.some(function(opt){ return String(opt).toLowerCase() === 'other'; });
    const baseOptions = rawOptions.filter(function(opt){ return String(opt).toLowerCase() !== 'other'; });

    function computeMatched(query){
      const matched = baseOptions.filter(function(opt){ return optionMatches(opt, query); });
      // 无论是否命中，都保证 Other 在候选列表中。
      if(hasOther || true){
        matched.push('Other');
      }
      return matched;
    }

    function rerender(){
      const query = String(detailEl.value || '').trim();
      const matched = computeMatched(query);
      fillSelectOptions(selectEl, matched, selectEl.value);
      if(query && matched.length === 2 && matched[1] === 'Other' && matched[0] !== 'Other'){
        // 当只有一个真实命中时，自动选中该项，减少额外点击。
        selectEl.value = matched[0];
      }
      if(query && matched.length === 1){
        // 当无命中时仅保留 Other。
        selectEl.value = 'Other';
      }
    }

    fillSelectOptions(selectEl, computeMatched(''), selectEl.value);
    detailEl.addEventListener('input', rerender);
  }

  function renderTypeField(config){
    const cfg = Object.assign({
      id: 'request-type',
      label: 'Type',
      name: 'type',
      required: false,
      options: TYPE_OPTIONS
    }, config || {});

    const optionsHtml = ['<option value="">Please select</option>'].concat(
      cfg.options.map(function(opt){
        return '<option value="' + escapeAttr(opt) + '">' + opt + '</option>';
      })
    ).join('');

    return '<div class="field-block type-field">' +
      '<label for="' + cfg.id + '">' + cfg.label + '</label>' +
      '<select id="' + cfg.id + '" name="' + cfg.name + '" ' + (cfg.required ? 'required' : '') + '>' + optionsHtml + '</select>' +
    '</div>';
  }

  function renderRewardField(config){
    const cfg = Object.assign({
      id: 'reward',
      label: 'Reward',
      name: 'reward',
      required: false,
      placeholder: 'e.g., 5'
    }, config || {});

    return '<div class="field-block reward-field">' +
      '<label for="' + cfg.id + '">' + cfg.label + '</label>' +
      '<div class="reward-input-wrap">' +
        '<input id="' + cfg.id + '" name="' + cfg.name + '" type="text" placeholder="' + escapeAttr(cfg.placeholder) + '" ' + (cfg.required ? 'required' : '') + '>' +
        '<span class="reward-suffix" aria-hidden="true">$</span>' +
      '</div>' +
    '</div>';
  }

  function renderSupportField(config){
    const cfg = Object.assign({
      id: 'use-access-support',
      name: 'use-access-support',
      label: 'Use 1 MavPoint to support this task (requires MavAccess verification)',
      hintId: 'support-hint',
      hintText: 'Available MavPoints: 0. Need 1 point.'
    }, config || {});

    return '<div class="field-block support-field">' +
      '<label class="support-option" for="' + cfg.id + '">' +
        '<input type="checkbox" id="' + cfg.id + '" name="' + cfg.name + '"> ' + escapeHtml(cfg.label) +
      '</label>' +
      '<p class="account-muted" id="' + cfg.hintId + '">' + escapeHtml(cfg.hintText) + '</p>' +
    '</div>';
  }

  function bindSupportMode(config){
    const cfg = Object.assign({
      checkboxId: 'use-access-support',
      rewardInputId: 'reward',
      hintId: 'support-hint',
      rewardSuffixSelector: '',
      availablePoints: function(){ return 0; },
      enabledHint: 'Use 1 MavPoint to support this task (requires MavAccess verification).',
      disabledHint: 'Available MavPoints: {points}. Need 1 point.'
    }, config || {});

    const checkbox = document.getElementById(cfg.checkboxId);
    const rewardInput = document.getElementById(cfg.rewardInputId);
    const hint = document.getElementById(cfg.hintId);
    const rewardSuffix = cfg.rewardSuffixSelector
      ? document.querySelector(cfg.rewardSuffixSelector)
      : (rewardInput && rewardInput.parentElement ? rewardInput.parentElement.querySelector('.reward-suffix') : null);

    if (!checkbox || !rewardInput) return function(){};

    function readPoints(){
      try {
        return Number(typeof cfg.availablePoints === 'function' ? cfg.availablePoints() : 0) || 0;
      } catch (error) {
        return 0;
      }
    }

    function refresh(){
      const useSupport = !!checkbox.checked;
      rewardInput.disabled = useSupport;
      rewardInput.style.opacity = useSupport ? '0.6' : '';

      if (useSupport) {
        rewardInput.value = '💜';
        rewardInput.setAttribute('aria-disabled', 'true');
      } else {
        const current = String(rewardInput.value || '').trim().toLowerCase();
        if (current === 'heart' || current === '💜' || current === '❤') rewardInput.value = '';
        rewardInput.removeAttribute('aria-disabled');
      }

      if (rewardSuffix) rewardSuffix.textContent = useSupport ? '💜' : '$';
      if (hint) {
        hint.textContent = useSupport
          ? cfg.enabledHint
          : cfg.disabledHint.replace('{points}', String(readPoints()));
      }
    }

    checkbox.addEventListener('change', refresh);
    refresh();
    return refresh;
  }

  function renderNoteField(config){
    const cfg = Object.assign({
      id: 'note',
      label: 'Note',
      name: 'note',
      placeholder: 'Any extra details',
      rows: 3,
      required: false
    }, config || {});

    return '<div class="field-block note-field">' +
      '<label for="' + cfg.id + '">' + cfg.label + '</label>' +
      '<textarea id="' + cfg.id + '" name="' + cfg.name + '" rows="' + cfg.rows + '" placeholder="' + escapeAttr(cfg.placeholder) + '" ' + (cfg.required ? 'required' : '') + '></textarea>' +
    '</div>';
  }

  function readLocationValue(key){
    const useSavedCheckbox = document.getElementById(key + '-use-saved');
    const savedSelect = document.getElementById(key + '-saved');
    if (useSavedCheckbox && savedSelect && useSavedCheckbox.checked) {
      const selectedOpt = savedSelect.options[savedSelect.selectedIndex];
      const savedLocation = selectedOpt ? String(selectedOpt.getAttribute('data-location') || '').trim() : '';
      if (savedLocation) return savedLocation;
    }

    const selectEl = document.getElementById(key + '-select');
    const detailEl = document.getElementById(key + '-detail');
    const selected = selectEl ? String(selectEl.value || '').trim() : '';
    const detail = detailEl ? String(detailEl.value || '').trim() : '';

    if(selected.toLowerCase() === 'other'){
      // 选择 Other 时优先使用用户输入，不强行拼接 "Other - ..."。
      return detail || 'Other';
    }

    if(selected && detail){
      return selected + ' - ' + detail;
    }
    return selected || detail;
  }

  function normalizeReward(raw, options){
    var opts = options || {};
    if (opts.supportMode) return 'heart';
    const text = String(raw || '').trim();
    if(!text) return '';
    const numeric = text.replace(/[^0-9.]/g, '');
    if(!numeric) return '';
    return '$' + numeric;
  }

  window.FormComponents = {
    LOCATION_OPTIONS: LOCATION_OPTIONS,
    TYPE_OPTIONS: TYPE_OPTIONS,
    renderLocationField: renderLocationField,
    renderTypeField: renderTypeField,
    renderRewardField: renderRewardField,
    renderSupportField: renderSupportField,
    bindSupportMode: bindSupportMode,
    renderNoteField: renderNoteField,
    initLocationAutocomplete: initLocationAutocomplete,
    initSavedAddressPicker: initSavedAddressPicker,
    readLocationValue: readLocationValue,
    normalizeReward: normalizeReward
  };
})();
