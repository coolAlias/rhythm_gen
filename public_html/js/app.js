class Rhythm
{
	constructor(num_bars, num_beats, num_notes, num_skips, skip_first = false)
	{
		this.num_bars = num_bars;
		this.num_beats = num_beats;
		this.num_notes = num_notes;
		this.pattern = getPattern(num_notes)?.substring(1);
		this.generate(num_skips, skip_first);
	}

	generate(num_skips, skip_first = false)
	{
		const notes_per_bar = this.num_beats * this.num_notes;
		const size = this.num_bars * notes_per_bar;
		this.rhythm = Array(size).fill(true, 0);
		const max = this.rhythm.length - 1;
		const min = (skip_first ? 0 : 1);
		const max_skips = (skip_first ? max : this.rhythm.length - this.num_bars);
		if (num_skips > max_skips) {
			num_skips = max_skips;
		}
		while (num_skips > 0) {
			const i = getRandomIntInclusive(min, max);
			if (this.rhythm[i] && (skip_first || i % notes_per_bar !== 0)) {
				this.rhythm[i] = false;
				num_skips = num_skips - 1;
			}
		}
	}

	getLines()
	{
		let bar_pattern = '';
		for (let i = 1; i <= this.num_beats; i++) {
			bar_pattern += '' + i + this.pattern;
		}
		let full_rhythm = '';
		for (let i = 0; i < this.rhythm.length; i++) {
			if (this.rhythm[i]) {
				full_rhythm += (i % 2 === 0 ? 'D' : 'U');
			} else {
				full_rhythm += ' ';
			}
		}
		const bar_len = this.num_beats * this.num_notes;
		let lines = [];
		for (let i = 0; i < this.num_bars; i++) {
			let rhythm_line = full_rhythm.substring(0, bar_len).replaceAll(' ', '&nbsp');
			lines.push(rhythm_line);
			lines.push(bar_pattern);
			full_rhythm = full_rhythm.substring(bar_len);
			if (full_rhythm.length > 0) {
				lines.push('');
			}
		}
		return lines;
	}
}

function getRandomIntInclusive(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1) + min);
}

function getRhythm(data)
{
	const bars  = +data.get('num_bars');
	const beats = +data.get('num_beats');
	const notes = +data.get('num_notes');
	const skips = +data.get('num_skips');
	// TODO Add option to allow skipping first note of each beat
	const skip_first = false;
	if (isNaN(bars) || bars < 1 || bars > 5) {
		return '<span class="error">Number of bars must be a number between 1 and 5.</span>';
	}
	if (isNaN(beats) || beats < 1 || beats > 9) {
		return '<span class="error">Number of beats must be a number between 1 and 9.</span>';
	}
	if (isNaN(notes) || notes < 1 || notes > 8) {
		return '<span class="error">Notes per beat must be a number between 1 and 8.</span>';
	}
	const max_skips = (skip_first ? (bars * beats * notes) - 1 : (bars * beats * notes) - bars);
	if (isNaN(skips) || skips < 0 || skips > max_skips) {
		return '<span class="error">Notes to skip must be a number between 0 and the total number of notes.</span>';
	}
	const rhythm = new Rhythm(bars, beats, notes, skips, skip_first);
	const lines = rhythm.getLines();
	let output = lines.reduce((s, line) => s + '<br>' + line);
	return output;
}

function getPattern(n)
{
	const patterns = [
		'n',
		'n+',
		'n+a',
		'ne+a',
		'nabcd',
		'nea+ea',
		'nabcdef',
		'ne+a&e+a',
	];
	let i = n - 1;
	if (i > -1 && i < patterns.length) {
		return patterns[i];
	}
	return null;
}

function getRandomIntInclusive(min, max)
{
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1) + min);
}

window.addEventListener("load", function(event)
{
	document.getElementById('form')?.addEventListener('submit', function(e) {
		e.preventDefault();
		const div = document.getElementById('output');
		const rhythm = getRhythm(new FormData(e.target));
		if (div && rhythm) {
			div.innerHTML = rhythm;
		}
	});
	document.getElementById('copy_link')?.addEventListener('click', function(e) {
		let output = document.getElementById('output')?.innerHTML;
		if (!output) {
			return;
		}
		output = output.replaceAll("<br>", "\n").replaceAll("&nbsp;", " ");
		navigator.clipboard.writeText(output).then(function() {
			const notice = document.getElementById('copy_notice');
			if (notice) {
				notice.classList.remove('hidden');
				setTimeout(() => notice.classList.add('hidden'), 2000);
			}
		}, function(err) {
			console.error('Failed to copy text: ', err);
		});
	});
});
