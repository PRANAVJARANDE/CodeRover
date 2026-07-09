const API_BASE = process.env.SEED_API_BASE || `http://localhost:${process.env.PORT || 8000}/api/v1`;
const TARGET_COUNT = Number.parseInt(process.env.SEED_TARGET_COUNT || "24", 10);

const solution = (cpp) => ({
    c: "",
    cpp,
    java: "",
    python: "",
});

const problems = [
    {
        title: "Valid Parentheses",
        description: "Given a string containing only bracket characters, determine whether every opening bracket is closed by the same type of bracket and in the correct order.",
        difficulty: "easy",
        constraints: ["1 <= s.length <= 100000", "s contains only the characters (), [], and {}."],
        example_cases: [
            { input: "()[]{}", output: "true", explanation: "Each bracket pair is closed correctly." },
            { input: "([)]", output: "false", explanation: "The brackets close in the wrong order." },
        ],
        test_cases: [
            { input: "{[()]}", output: "true" },
            { input: "(((", output: "false" },
            { input: "]", output: "false" },
            { input: "([]{})", output: "true" },
            { input: "([{}])[]", output: "true" },
        ],
        solution: solution(`Use a stack. Push opening brackets. For every closing bracket, check whether the stack top is its matching opening bracket. At the end, the stack must be empty.`),
        input_format: "A single string s.",
        output_format: "Print true if the bracket sequence is valid, otherwise print false.",
    },
    {
        title: "Valid Anagram",
        description: "Given two lowercase strings, check whether one string can be rearranged to form the other.",
        difficulty: "easy",
        constraints: ["1 <= length of each string <= 100000", "Both strings contain lowercase English letters only."],
        example_cases: [
            { input: "listen\nsilent", output: "true", explanation: "Both words have the same character frequencies." },
            { input: "rat\ncar", output: "false", explanation: "The character frequencies are different." },
        ],
        test_cases: [
            { input: "a\na", output: "true" },
            { input: "abb\nbab", output: "true" },
            { input: "abc\nabcc", output: "false" },
            { input: "night\nthing", output: "true" },
            { input: "code\ndeco", output: "true" },
        ],
        solution: solution(`Count the frequency of all 26 letters in the first string and subtract the frequencies from the second string. If every count is zero, the strings are anagrams.`),
        input_format: "Two strings s and t on separate lines.",
        output_format: "Print true if t is an anagram of s, otherwise print false.",
    },
    {
        title: "Best Time to Buy and Sell Stock",
        description: "Given daily stock prices, choose one day to buy and a later day to sell. Return the maximum profit possible. If no profit is possible, return 0.",
        difficulty: "easy",
        constraints: ["1 <= n <= 100000", "0 <= price[i] <= 100000"],
        example_cases: [
            { input: "6\n7 1 5 3 6 4", output: "5", explanation: "Buy at 1 and sell at 6." },
            { input: "5\n7 6 4 3 1", output: "0", explanation: "Prices keep decreasing." },
        ],
        test_cases: [
            { input: "1\n5", output: "0" },
            { input: "4\n1 2 3 4", output: "3" },
            { input: "6\n2 4 1 7 5 3", output: "6" },
            { input: "5\n3 3 3 3 3", output: "0" },
            { input: "8\n9 2 8 1 6 7 3 10", output: "9" },
        ],
        solution: solution(`Track the minimum price seen so far. For each price, update the best profit using price - minimumPrice, then update minimumPrice.`),
        input_format: "First line contains n. Second line contains n space-separated prices.",
        output_format: "Print the maximum profit.",
    },
    {
        title: "Move Zeroes to End",
        description: "Given an array of integers, move all zeroes to the end while keeping the relative order of all non-zero elements unchanged.",
        difficulty: "easy",
        constraints: ["1 <= n <= 100000", "-100000 <= arr[i] <= 100000"],
        example_cases: [
            { input: "5\n0 1 0 3 12", output: "1 3 12 0 0", explanation: "Non-zero elements keep their original order." },
            { input: "3\n0 0 1", output: "1 0 0", explanation: "The only non-zero value moves to the front." },
        ],
        test_cases: [
            { input: "1\n0", output: "0" },
            { input: "4\n1 2 3 4", output: "1 2 3 4" },
            { input: "6\n0 0 0 2 0 5", output: "2 5 0 0 0 0" },
            { input: "7\n4 0 -1 0 2 0 3", output: "4 -1 2 3 0 0 0" },
            { input: "5\n5 0 0 0 0", output: "5 0 0 0 0" },
        ],
        solution: solution(`Use a write pointer. Copy every non-zero element to the next write position, then fill the remaining positions with zeroes.`),
        input_format: "First line contains n. Second line contains n space-separated integers.",
        output_format: "Print the updated array as space-separated integers.",
    },
    {
        title: "Merge Two Sorted Arrays",
        description: "Given two sorted arrays, merge them into one sorted array.",
        difficulty: "easy",
        constraints: ["1 <= n, m <= 100000", "-100000 <= arr[i] <= 100000"],
        example_cases: [
            { input: "3\n1 3 5\n4\n2 4 6 8", output: "1 2 3 4 5 6 8", explanation: "All values are merged in sorted order." },
            { input: "2\n1 2\n2\n3 4", output: "1 2 3 4", explanation: "The first array values come before the second." },
        ],
        test_cases: [
            { input: "1\n5\n1\n1", output: "1 5" },
            { input: "4\n1 1 2 9\n3\n1 3 10", output: "1 1 1 2 3 9 10" },
            { input: "3\n-5 -2 0\n3\n-3 4 8", output: "-5 -3 -2 0 4 8" },
            { input: "5\n2 4 6 8 10\n1\n7", output: "2 4 6 7 8 10" },
            { input: "2\n100 200\n3\n-1 0 300", output: "-1 0 100 200 300" },
        ],
        solution: solution(`Use two pointers. At each step, append the smaller current value and advance that pointer. Append the remaining suffix when one array ends.`),
        input_format: "First line contains n, second line contains n sorted integers, third line contains m, fourth line contains m sorted integers.",
        output_format: "Print the merged sorted array.",
    },
    {
        title: "Maximum Subarray Sum",
        description: "Given an integer array, find the largest possible sum of a contiguous non-empty subarray.",
        difficulty: "medium",
        constraints: ["1 <= n <= 100000", "-100000 <= arr[i] <= 100000"],
        example_cases: [
            { input: "9\n-2 1 -3 4 -1 2 1 -5 4", output: "6", explanation: "The best subarray is 4 -1 2 1." },
            { input: "5\n-5 -2 -8 -1 -3", output: "-1", explanation: "The best subarray contains only -1." },
        ],
        test_cases: [
            { input: "1\n7", output: "7" },
            { input: "5\n1 2 3 4 5", output: "15" },
            { input: "6\n5 -10 6 7 -2 3", output: "14" },
            { input: "4\n-1 -2 -3 -4", output: "-1" },
            { input: "8\n2 -1 2 3 4 -5 6 -10", output: "11" },
        ],
        solution: solution(`Use Kadane's algorithm. Let current be the best subarray ending at the current index. current = max(value, current + value). Track the maximum current value.`),
        input_format: "First line contains n. Second line contains n space-separated integers.",
        output_format: "Print the maximum subarray sum.",
    },
    {
        title: "Product of Array Except Self",
        description: "For each index, return the product of all array values except the value at that index. Do this without using division.",
        difficulty: "medium",
        constraints: ["2 <= n <= 100000", "-30 <= arr[i] <= 30", "The product values fit in 64-bit signed integer range."],
        example_cases: [
            { input: "4\n1 2 3 4", output: "24 12 8 6", explanation: "Each output excludes the current element." },
            { input: "5\n-1 1 0 -3 3", output: "0 0 9 0 0", explanation: "Only the zero index receives the product of non-zero values." },
        ],
        test_cases: [
            { input: "2\n5 10", output: "10 5" },
            { input: "3\n2 3 4", output: "12 8 6" },
            { input: "4\n0 0 1 2", output: "0 0 0 0" },
            { input: "5\n1 1 1 1 1", output: "1 1 1 1 1" },
            { input: "4\n-2 3 -4 5", output: "-60 40 -30 24" },
        ],
        solution: solution(`Build prefix products from the left and multiply by suffix products from the right. This gives each index the product of values before and after it.`),
        input_format: "First line contains n. Second line contains n space-separated integers.",
        output_format: "Print n space-separated products.",
    },
    {
        title: "Longest Substring Without Repeating Characters",
        description: "Given a string, find the length of the longest contiguous substring that has no repeated characters.",
        difficulty: "medium",
        constraints: ["1 <= s.length <= 100000", "s contains lowercase English letters."],
        example_cases: [
            { input: "abcabcbb", output: "3", explanation: "abc is one longest substring." },
            { input: "bbbbb", output: "1", explanation: "Only one unique character can be used at a time." },
        ],
        test_cases: [
            { input: "pwwkew", output: "3" },
            { input: "abcdef", output: "6" },
            { input: "abba", output: "2" },
            { input: "dvdf", output: "3" },
            { input: "anviaj", output: "5" },
        ],
        solution: solution(`Use a sliding window with last seen positions. Move the left boundary past the previous occurrence of the current character and update the best length.`),
        input_format: "A single string s.",
        output_format: "Print the maximum substring length.",
    },
    {
        title: "Rotate Array Right",
        description: "Rotate an array to the right by k positions.",
        difficulty: "medium",
        constraints: ["1 <= n <= 100000", "0 <= k <= 1000000000", "-100000 <= arr[i] <= 100000"],
        example_cases: [
            { input: "7\n1 2 3 4 5 6 7\n3", output: "5 6 7 1 2 3 4", explanation: "The last three values move to the front." },
            { input: "4\n-1 -100 3 99\n2", output: "3 99 -1 -100", explanation: "Rotating by two swaps the two halves." },
        ],
        test_cases: [
            { input: "1\n10\n100", output: "10" },
            { input: "5\n1 2 3 4 5\n0", output: "1 2 3 4 5" },
            { input: "5\n1 2 3 4 5\n5", output: "1 2 3 4 5" },
            { input: "6\n10 20 30 40 50 60\n8", output: "50 60 10 20 30 40" },
            { input: "3\n7 8 9\n1", output: "9 7 8" },
        ],
        solution: solution(`Reduce k modulo n. Reverse the whole array, reverse the first k elements, then reverse the remaining n-k elements.`),
        input_format: "First line contains n. Second line contains n integers. Third line contains k.",
        output_format: "Print the rotated array.",
    },
    {
        title: "Spiral Matrix Traversal",
        description: "Given a matrix, print all elements in clockwise spiral order starting from the top-left corner.",
        difficulty: "medium",
        constraints: ["1 <= rows, cols <= 100", "-100000 <= matrix[i][j] <= 100000"],
        example_cases: [
            { input: "3 3\n1 2 3\n4 5 6\n7 8 9", output: "1 2 3 6 9 8 7 4 5", explanation: "Traverse the boundary inward." },
            { input: "3 4\n1 2 3 4\n5 6 7 8\n9 10 11 12", output: "1 2 3 4 8 12 11 10 9 5 6 7", explanation: "The final inner row is printed left to right." },
        ],
        test_cases: [
            { input: "1 4\n1 2 3 4", output: "1 2 3 4" },
            { input: "4 1\n1\n2\n3\n4", output: "1 2 3 4" },
            { input: "2 2\n1 2\n3 4", output: "1 2 4 3" },
            { input: "4 3\n1 2 3\n4 5 6\n7 8 9\n10 11 12", output: "1 2 3 6 9 12 11 10 7 4 5 8" },
            { input: "2 5\n1 2 3 4 5\n6 7 8 9 10", output: "1 2 3 4 5 10 9 8 7 6" },
        ],
        solution: solution(`Maintain top, bottom, left, and right boundaries. Traverse top row, right column, bottom row, and left column while shrinking the boundaries after each pass.`),
        input_format: "First line contains rows and cols. Next rows lines contain cols integers each.",
        output_format: "Print the spiral traversal as space-separated integers.",
    },
    {
        title: "Search in Rotated Sorted Array",
        description: "Given a sorted array rotated at an unknown pivot and a target value, return the target index or -1 if it is missing.",
        difficulty: "medium",
        constraints: ["1 <= n <= 100000", "All array values are distinct.", "-100000 <= arr[i], target <= 100000"],
        example_cases: [
            { input: "7\n4 5 6 7 0 1 2\n0", output: "4", explanation: "Target 0 is at index 4." },
            { input: "7\n4 5 6 7 0 1 2\n3", output: "-1", explanation: "Target 3 does not exist." },
        ],
        test_cases: [
            { input: "1\n1\n1", output: "0" },
            { input: "1\n1\n0", output: "-1" },
            { input: "5\n1 2 3 4 5\n4", output: "3" },
            { input: "6\n6 7 1 2 3 4\n7", output: "1" },
            { input: "8\n30 40 50 60 5 10 20 25\n20", output: "6" },
        ],
        solution: solution(`Use modified binary search. At each step, one half is sorted. Decide whether the target lies inside that sorted half, then discard the other half.`),
        input_format: "First line contains n. Second line contains n integers. Third line contains target.",
        output_format: "Print the target index, or -1.",
    },
    {
        title: "Kth Largest Element",
        description: "Given an unsorted array and an integer k, return the kth largest element.",
        difficulty: "medium",
        constraints: ["1 <= k <= n <= 100000", "-100000 <= arr[i] <= 100000"],
        example_cases: [
            { input: "6\n3 2 1 5 6 4\n2", output: "5", explanation: "The sorted order descending is 6, 5, 4, 3, 2, 1." },
            { input: "9\n3 2 3 1 2 4 5 5 6\n4", output: "4", explanation: "The fourth largest value is 4." },
        ],
        test_cases: [
            { input: "1\n10\n1", output: "10" },
            { input: "5\n5 5 5 5 5\n3", output: "5" },
            { input: "5\n-1 -2 -3 -4 -5\n1", output: "-1" },
            { input: "7\n7 10 4 3 20 15 8\n3", output: "10" },
            { input: "6\n1 9 8 7 6 5\n6", output: "1" },
        ],
        solution: solution(`Use a min-heap of size k. Push values one by one; if the heap grows larger than k, remove the smallest. The heap top is the kth largest.`),
        input_format: "First line contains n. Second line contains n integers. Third line contains k.",
        output_format: "Print the kth largest element.",
    },
    {
        title: "Coin Change Minimum Coins",
        description: "Given coin denominations and an amount, find the minimum number of coins needed to make that amount. If it is impossible, print -1.",
        difficulty: "medium",
        constraints: ["0 <= amount <= 10000", "1 <= number of coins <= 100", "1 <= coin[i] <= 10000"],
        example_cases: [
            { input: "11\n3\n1 2 5", output: "3", explanation: "11 = 5 + 5 + 1." },
            { input: "3\n1\n2", output: "-1", explanation: "Amount 3 cannot be formed using only coin 2." },
        ],
        test_cases: [
            { input: "0\n3\n1 2 5", output: "0" },
            { input: "7\n2\n2 4", output: "-1" },
            { input: "27\n4\n2 5 10 1", output: "4" },
            { input: "6\n3\n1 3 4", output: "2" },
            { input: "100\n4\n1 5 10 25", output: "4" },
        ],
        solution: solution(`Use dynamic programming. dp[x] stores the minimum coins needed for amount x. For every amount, try every coin and update dp[x] from dp[x - coin].`),
        input_format: "First line contains amount. Second line contains n. Third line contains n coin values.",
        output_format: "Print the minimum number of coins, or -1.",
    },
    {
        title: "Number of Islands",
        description: "Given a grid of 0s and 1s, count how many connected groups of 1s exist. Cells are connected vertically or horizontally.",
        difficulty: "medium",
        constraints: ["1 <= rows, cols <= 300", "Each grid cell is either 0 or 1."],
        example_cases: [
            { input: "4 5\n11000\n11000\n00100\n00011", output: "3", explanation: "There are three separated land groups." },
            { input: "3 3\n111\n010\n111", output: "1", explanation: "All land is connected through the center." },
        ],
        test_cases: [
            { input: "1 1\n1", output: "1" },
            { input: "1 1\n0", output: "0" },
            { input: "3 4\n1010\n0000\n1011", output: "4" },
            { input: "4 4\n1111\n0001\n0011\n0000", output: "1" },
            { input: "5 5\n11000\n11010\n00100\n00011\n10000", output: "4" },
        ],
        solution: solution(`Scan every cell. When an unvisited land cell is found, increment the answer and run DFS or BFS to mark its entire island as visited.`),
        input_format: "First line contains rows and cols. Next rows lines contain a string of 0s and 1s.",
        output_format: "Print the number of islands.",
    },
    {
        title: "Top K Frequent Numbers",
        description: "Given an array and k, print the k most frequent numbers. If two numbers have the same frequency, the smaller number should come first.",
        difficulty: "medium",
        constraints: ["1 <= k <= number of distinct values <= n <= 100000", "-100000 <= arr[i] <= 100000"],
        example_cases: [
            { input: "6\n1 1 1 2 2 3\n2", output: "1 2", explanation: "1 appears three times and 2 appears twice." },
            { input: "6\n4 4 1 1 2 2\n2", output: "1 2", explanation: "All tie by frequency, so smaller values are first." },
        ],
        test_cases: [
            { input: "1\n5\n1", output: "5" },
            { input: "8\n3 3 3 2 2 1 1 1\n2", output: "1 3" },
            { input: "10\n5 6 5 6 5 7 8 8 8 8\n3", output: "8 5 6" },
            { input: "7\n-1 -1 -2 -2 -2 3 3\n2", output: "-2 -1" },
            { input: "9\n9 8 7 9 8 9 6 6 6\n2", output: "6 9" },
        ],
        solution: solution(`Count frequencies with a hash map. Sort pairs by frequency descending and value ascending. Print the first k values.`),
        input_format: "First line contains n. Second line contains n integers. Third line contains k.",
        output_format: "Print the k selected numbers separated by spaces.",
    },
    {
        title: "Daily Temperatures",
        description: "For each day, find how many days must pass until a warmer temperature occurs. If none occurs, output 0 for that day.",
        difficulty: "medium",
        constraints: ["1 <= n <= 100000", "0 <= temperature[i] <= 100"],
        example_cases: [
            { input: "8\n73 74 75 71 69 72 76 73", output: "1 1 4 2 1 1 0 0", explanation: "Each value shows the wait until a warmer day." },
            { input: "4\n30 40 50 60", output: "1 1 1 0", explanation: "Each day except the last is followed by a warmer day." },
        ],
        test_cases: [
            { input: "3\n30 60 90", output: "1 1 0" },
            { input: "3\n90 80 70", output: "0 0 0" },
            { input: "5\n70 70 71 69 72", output: "2 1 2 1 0" },
            { input: "6\n50 40 45 60 55 65", output: "3 1 1 2 1 0" },
            { input: "1\n100", output: "0" },
        ],
        solution: solution(`Use a monotonic decreasing stack of indices. When the current temperature is warmer than the stack top, pop and compute the distance.`),
        input_format: "First line contains n. Second line contains n temperatures.",
        output_format: "Print n space-separated wait counts.",
    },
    {
        title: "Median of Two Sorted Arrays",
        description: "Given two sorted arrays, find the median value of the combined sorted data.",
        difficulty: "hard",
        constraints: ["0 <= n, m <= 100000", "n + m >= 1", "-100000 <= arr[i] <= 100000"],
        example_cases: [
            { input: "2\n1 3\n1\n2", output: "2.0", explanation: "The combined array is 1 2 3." },
            { input: "2\n1 2\n2\n3 4", output: "2.5", explanation: "The median is the average of 2 and 3." },
        ],
        test_cases: [
            { input: "1\n0\n1\n0", output: "0.0" },
            { input: "3\n1 2 3\n3\n4 5 6", output: "3.5" },
            { input: "0\n\n5\n1 2 3 4 5", output: "3.0" },
            { input: "4\n1 2 100 101\n3\n3 4 5", output: "4.0" },
            { input: "5\n-5 -3 -1 0 2\n4\n4 6 8 10", output: "2.0" },
        ],
        solution: solution(`A simple solution is to merge both sorted arrays until the middle positions are reached. For an optimal solution, binary search the partition in the smaller array.`),
        input_format: "First line contains n. Second line contains n sorted integers, or an empty line if n is 0. Third line contains m. Fourth line contains m sorted integers.",
        output_format: "Print the median with exactly one digit after the decimal point.",
    },
    {
        title: "Trapping Rain Water",
        description: "Given bar heights, compute how much water can be trapped after raining.",
        difficulty: "hard",
        constraints: ["1 <= n <= 100000", "0 <= height[i] <= 100000"],
        example_cases: [
            { input: "12\n0 1 0 2 1 0 1 3 2 1 2 1", output: "6", explanation: "The bars trap 6 units of water." },
            { input: "6\n4 2 0 3 2 5", output: "9", explanation: "The valleys trap 9 units total." },
        ],
        test_cases: [
            { input: "3\n1 2 3", output: "0" },
            { input: "3\n3 2 1", output: "0" },
            { input: "5\n2 0 2 0 2", output: "4" },
            { input: "7\n5 4 1 2 1 4 2", output: "10" },
            { input: "1\n0", output: "0" },
        ],
        solution: solution(`Use two pointers from both ends. Track the best left and right boundaries. Move the side with the smaller boundary and add trapped water when the current height is lower.`),
        input_format: "First line contains n. Second line contains n bar heights.",
        output_format: "Print the total trapped water.",
    },
];

const getExistingProblems = async () => {
    const response = await fetch(`${API_BASE}/problem`);
    if(!response.ok)
    {
        throw new Error(`Unable to fetch existing problems: ${response.status}`);
    }
    const body = await response.json();
    return Array.isArray(body.data) ? body.data : [];
};

const createProblem = async (problem) => {
    const response = await fetch(`${API_BASE}/problem/createproblem`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(problem),
    });
    const body = await response.json().catch(() => ({}));
    if(!response.ok)
    {
        throw new Error(body.message || `Failed to create ${problem.title}: ${response.status}`);
    }
    return body.data;
};

const main = async () => {
    const existingProblems = await getExistingProblems();
    const existingTitles = new Set(existingProblems.map((problem) => problem.title.toLowerCase()));
    let currentCount = existingProblems.length;

    console.log(`Existing problems: ${currentCount}`);
    for(const problem of problems)
    {
        if(currentCount >= TARGET_COUNT)
        {
            break;
        }

        if(existingTitles.has(problem.title.toLowerCase()))
        {
            console.log(`Skipping existing title: ${problem.title}`);
            continue;
        }

        await createProblem(problem);
        existingTitles.add(problem.title.toLowerCase());
        currentCount += 1;
        console.log(`Added ${currentCount}/${TARGET_COUNT}: ${problem.title}`);
    }

    const finalProblems = await getExistingProblems();
    console.log(`Final problems: ${finalProblems.length}`);
    if(finalProblems.length < TARGET_COUNT)
    {
        throw new Error(`Only ${finalProblems.length} problems exist; add more seed data to reach ${TARGET_COUNT}.`);
    }
};

main().catch((error) => {
    console.error(error.message);
    process.exit(1);
});
