// 定数の定義
const base = 48764;        // 生活費
const winterAdd = 2150;      // 冬期加算(11～3月)
// 管理費(1人部屋)
const singleLowerAprOct = 15000;
const singleUpperAprOct = 28875;
// 管理費(2人部屋)
const doubleLowerAprOct = 31625;
const doubleUpperAprOct = 38750;

// ページ読み込み時にUIを初期化
window.onload = () => {
  updateUI();
};

// UI の表示切替
function updateUI() {
  const roomType = document.querySelector('input[name="roomType"]:checked').value;
  const marriedCheck = document.getElementById('marriedCheck');
  const marriedSection = document.getElementById('marriedSection');
  const marriedNote = document.getElementById('marriedNote');
  const occupant2Section = document.getElementById('occupant2Section');

  // 初期状態として全て非表示
  marriedSection.classList.add('hidden');
  marriedNote.classList.add('hidden');
  occupant2Section.classList.add('hidden');

  if (roomType === '1') {
    // 1人部屋の場合、夫婦チェックは無効
    marriedCheck.checked = false;
  } else if (roomType === '2') {
    // 2人部屋の場合、夫婦チェックを表示
    marriedSection.classList.remove('hidden');
    if (marriedCheck.checked) {
      marriedNote.classList.remove('hidden');
    } else {
      occupant2Section.classList.remove('hidden');
    }
  } else if (roomType === '3') {
    // 1人部屋×2（夫婦の場合）
    occupant2Section.classList.remove('hidden');
    marriedCheck.checked = false;
  }
}

// シミュレーション計算
function calculateFee() {
  const roomType = document.querySelector('input[name="roomType"]:checked').value;
  const marriedFlag = document.getElementById('marriedCheck').checked;

  // 入居者1の収入階層区分
  const bracketSelect1 = document.getElementById('incomeBracket1');
  let x1 = parseInt(bracketSelect1.value, 10);
  const bracketIndex1 = bracketSelect1.selectedIndex;

  // 入居者2の収入階層区分（必要な場合）
  let x2 = 0;
  let bracketIndex2 = -1;
  const bracketSelect2 = document.getElementById('incomeBracket2');
  if (bracketSelect2) {
    bracketIndex2 = bracketSelect2.selectedIndex;
    x2 = parseInt(bracketSelect2.value, 10);
  }

  // 夫婦の場合、または1人部屋×2の場合の調整
  if (roomType === '2' && marriedFlag && bracketIndex1 === 0) {
    x1 = 7000;
  }
  if (roomType === '3') {
    if (bracketIndex1 === 0) {
      x1 = 7000;
    }
    if (bracketIndex2 === 0) {
      x2 = 7000;
    }
  }

  // 事務費の合計計算
  let xTotal = 0;
  if (roomType === '1') {
    xTotal = x1;
  } else if (roomType === '2') {
    if (marriedFlag) {
      xTotal = x1 * 2;
    } else {
      xTotal = x1 + x2;
    }
  } else if (roomType === '3') {
    xTotal = x1 + x2;
  }

  // 結果表示エリアの取得
  const resultSection = document.getElementById('resultSection');
  const resultBox = document.getElementById('resultBox');
  resultBox.innerHTML = ''; // 初期化

  let html = '';

  // 部屋タイプに応じた利用料の計算と表示
  if (roomType === '1') {
    const aprOctLower = base + x1 + singleLowerAprOct;
    const aprOctUpper = base + x1 + singleUpperAprOct;
    const novMarLower = base + winterAdd + x1 + singleLowerAprOct;
    const novMarUpper = base + winterAdd + x1 + singleUpperAprOct;

    html += `<div class="range-result"><strong>1人部屋 (4～10月):</strong> ${aprOctLower.toLocaleString()}円 ～ ${aprOctUpper.toLocaleString()}円</div>`;
    html += `<div class="range-result"><strong>1人部屋 (11～3月):</strong> ${novMarLower.toLocaleString()}円 ～ ${novMarUpper.toLocaleString()}円</div>`;
    html += makeBreakdownHTML(xTotal, 1, false, x1, 0);
  } else if (roomType === '2') {
    if (marriedFlag) {
      // 夫婦の場合
      const aprOctLower1 = base + x1 + doubleLowerAprOct;
      const aprOctUpper1 = base + x1 + doubleUpperAprOct;
      const occupant2AprOct = base + x1;

      const totalAprOctLower = aprOctLower1 + occupant2AprOct;
      const totalAprOctUpper = aprOctUpper1 + occupant2AprOct;

      const novMarLower1 = base + winterAdd + x1 + doubleLowerAprOct;
      const novMarUpper1 = base + winterAdd + x1 + doubleUpperAprOct;
      const occupant2NovMar = base + winterAdd + x1;

      const totalNovMarLower = novMarLower1 + occupant2NovMar;
      const totalNovMarUpper = novMarUpper1 + occupant2NovMar;

      html += `<div class="range-result"><strong>2人部屋 (4～10月) </br>合計:</strong> ${totalAprOctLower.toLocaleString()}円 ～ ${totalAprOctUpper.toLocaleString()}円</div>`;
      html += `<ul>
                <li><strong>1人目(4～10月):</strong> ${aprOctLower1.toLocaleString()}円 ～ ${aprOctUpper1.toLocaleString()}円</li>
                <li><strong>2人目(4～10月):</strong> ${occupant2AprOct.toLocaleString()}円</li>
              </ul>`;
      html += `<div class="range-result"><strong>2人部屋 (11～3月) </br>合計:</strong> ${totalNovMarLower.toLocaleString()}円 ～ ${totalNovMarUpper.toLocaleString()}円</div>`;
      html += `<ul>
                <li><strong>1人目(11～3月):</strong> ${novMarLower1.toLocaleString()}円 ～ ${novMarUpper1.toLocaleString()}円</li>
                <li><strong>2人目(11～3月):</strong> ${occupant2NovMar.toLocaleString()}円</li>
              </ul>`;
      html += `<p class="small-note">※夫婦で2人部屋を利用する場合の目安です。</p>`;
      html += makeBreakdownHTML(xTotal, 2, marriedFlag, x1, x2);
    } else {
      // 非夫婦の場合
      const aprOctLower1 = base + x1 + doubleLowerAprOct;
      const aprOctUpper1 = base + x1 + doubleUpperAprOct;
      const aprOctLower2 = base + x2;
      const aprOctUpper2 = base + x2;

      const totalAprOctLower = aprOctLower1 + aprOctLower2;
      const totalAprOctUpper = aprOctUpper1 + aprOctUpper2;

      const novMarLower1 = base + winterAdd + x1 + doubleLowerAprOct;
      const novMarUpper1 = base + winterAdd + x1 + doubleUpperAprOct;
      const novMarLower2 = base + winterAdd + x2;
      const novMarUpper2 = base + winterAdd + x2;

      const totalNovMarLower = novMarLower1 + novMarLower2;
      const totalNovMarUpper = novMarUpper1 + novMarUpper2;

      html += `<div class="range-result"><strong>2人部屋 (4～10月) </br>合計:</strong> ${totalAprOctLower.toLocaleString()}円 ～ ${totalAprOctUpper.toLocaleString()}円</div>`;
      html += `<ul>
                <li><strong>1人目(4～10月):</strong> ${aprOctLower1.toLocaleString()}円 ～ ${aprOctUpper1.toLocaleString()}円</li>
                <li><strong>2人目(4～10月):</strong> ${aprOctLower2.toLocaleString()}円</li>
              </ul>`;
      html += `<div class="range-result"><strong>2人部屋 (11～3月) </br>合計:</strong> ${totalNovMarLower.toLocaleString()}円 ～ ${totalNovMarUpper.toLocaleString()}円</div>`;
      html += `<ul>
                <li><strong>1人目(11～3月):</strong> ${novMarLower1.toLocaleString()}円 ～ ${novMarUpper1.toLocaleString()}円</li>
                <li><strong>2人目(11～3月):</strong> ${novMarLower2.toLocaleString()}円</li>
              </ul>`;
      html += makeBreakdownHTML(xTotal, 2, marriedFlag, x1, x2);
    }
  } else if (roomType === '3') {
    // 1人部屋×2（夫婦の場合）の処理
    const aprOctLower = base + x1 + singleLowerAprOct;
    const aprOctUpper = base + x1 + singleUpperAprOct;
    const novMarLower = base + winterAdd + x1 + singleLowerAprOct;
    const novMarUpper = base + winterAdd + x1 + singleUpperAprOct;

    html += `<div class="range-result"><strong>1人部屋×2 (4～10月):</strong> ${aprOctLower.toLocaleString()}円 ～ ${aprOctUpper.toLocaleString()}円</div>`;
    html += `<div class="range-result"><strong>1人部屋×2 (11～3月):</strong> ${novMarLower.toLocaleString()}円 ～ ${novMarUpper.toLocaleString()}円</div>`;
    html += makeBreakdownHTML(xTotal, 2, true, x1, x2);
  }
  html += `<p class="small-note">※1 お部屋の日当たりや広さによって金額が異なります</p>`;
  html += `<p class="small-note">※2 上記料金に加えて水道代・電気代が実費負担となります。</p>`;

  resultBox.innerHTML = html;
  resultSection.classList.remove('hidden');
}

// 内訳を生成する関数
function makeBreakdownHTML(xTotal, roomType, isMarried = false, x1 = 0, x2 = 0) {
  let managementCost = '';
  if (roomType === 1) {
    managementCost = '15,000円～28,875円';
  } else {
    managementCost = '31,625円～38,750円';
  }

  let html = `<div class="breakdown">\n  <h3>内訳</h3>\n  <ul>\n`;
  if (roomType === 1) {
    html += `<li><strong>生活費</strong>：48,764円</li>\n`;
    html += `<li><strong>冬期加算</strong>：2,150円（11～3月）</li>\n`;
  } else {
    const livingTotal = 48764 * 2;
    const winterTotal = 2150 * 2;
    html += `<li><strong>生活費合計</strong>：${livingTotal.toLocaleString()}円 (48,764円 + 48,764円)</li>\n`;
    html += `<li><strong>冬期加算合計</strong>：${winterTotal.toLocaleString()}円 (2,150円 + 2,150円)（11～3月）</li>\n`;
  }
  html += `<li><strong>管理費※1</strong>：${managementCost} </li>\n`;
  if (roomType === 2) {
    if (isMarried) {
      const totalAdmin = x1 * 2;
      html += `<li><strong>事務費合計</strong>：${totalAdmin.toLocaleString()}円 (1人目: ${x1.toLocaleString()}円 + 2人目: ${x1.toLocaleString()}円)</li>\n`;
    } else {
      html += `<li><strong>事務費合計</strong>：${xTotal.toLocaleString()}円 (1人目: ${x1.toLocaleString()}円 + 2人目: ${x2.toLocaleString()}円)</li>\n`;
    }
  } else {
    html += `<li><strong>事務費</strong>：${xTotal.toLocaleString()}円</li>\n`;
  }
  html += `</ul>\n</div>`;
  return html;
}
