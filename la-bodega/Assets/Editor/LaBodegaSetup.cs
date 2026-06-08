using UnityEngine;
using UnityEngine.UI;
using UnityEngine.EventSystems;
using UnityEditor;
using UnityEditor.SceneManagement;
using TMPro;

public static class LaBodegaSetup
{
    const string SceneFolder = "Assets/Scenes";
    const string ScenePath   = "Assets/Scenes/";

    [MenuItem("Tools/La Bodega/Setup Full Project")]
    public static void SetupFullProject()
    {
        if (!AssetDatabase.IsValidFolder(SceneFolder))
            AssetDatabase.CreateFolder("Assets", "Scenes");

        BuildCharacterCustomizationScene();
        BuildCutsceneScene();
        BuildBodegaDayScene();
        BuildGameOverScene();
        SetBuildSettings();

        EditorSceneManager.OpenScene(ScenePath + "CharacterCustomization.unity");
        AssetDatabase.SaveAssets();
        AssetDatabase.Refresh();
        Debug.Log("[La Bodega] Setup complete. Press Play to test.");
    }

    // ── Scene 0 ────────────────────────────────────────────────────────────────

    static void BuildCharacterCustomizationScene()
    {
        var scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);
        AddCamera();
        AddEventSystem();
        new GameObject("GameManager").AddComponent<GameManager>();

        var canvas = MakeCanvas();
        var ct = canvas.transform;

        MakePanel(ct, "Background", new Color(0.10f, 0.07f, 0.04f));

        var title = MakeTMP(ct, "Title", "La Bodega", 48);
        title.color = new Color(1f, 0.85f, 0.3f);
        AnchorPos(title.gameObject, new Vector2(0, 355), new Vector2(380, 68));

        var sub = MakeTMP(ct, "Subtitle", "Create Your Character", 20);
        sub.color = new Color(0.75f, 0.65f, 0.45f);
        AnchorPos(sub.gameObject, new Vector2(0, 308), new Vector2(380, 36));

        // ── Character preview (left column, x=-90) ──
        var previewPanel = new GameObject("PreviewPanel");
        previewPanel.transform.SetParent(ct, false);
        AnchorPos(previewPanel, new Vector2(-90f, 60f), new Vector2(160f, 290f));
        previewPanel.AddComponent<Image>().color = new Color(0.16f, 0.11f, 0.07f);
        var pp = previewPanel.transform;

        var knob = AssetDatabase.GetBuiltinExtraResource<Sprite>("UI/Skin/Knob.psd");

        var hairGO = new GameObject("Hair");
        hairGO.transform.SetParent(pp, false);
        AnchorPos(hairGO, new Vector2(0f, 105f), new Vector2(58f, 22f));
        var hairImg = hairGO.AddComponent<Image>();
        hairImg.color = new Color(0.13f, 0.07f, 0.02f);

        var headGO = new GameObject("Head");
        headGO.transform.SetParent(pp, false);
        AnchorPos(headGO, new Vector2(0f, 45f), new Vector2(72f, 72f));
        var headImg = headGO.AddComponent<Image>();
        headImg.sprite = knob;
        headImg.color = new Color(0.94f, 0.76f, 0.58f);

        var eyeL = new GameObject("EyeL");
        eyeL.transform.SetParent(pp, false);
        AnchorPos(eyeL, new Vector2(-14f, 52f), new Vector2(10f, 10f));
        var eyeLImg = eyeL.AddComponent<Image>();
        eyeLImg.sprite = knob;
        eyeLImg.color = new Color(0.1f, 0.06f, 0.02f);

        var eyeR = new GameObject("EyeR");
        eyeR.transform.SetParent(pp, false);
        AnchorPos(eyeR, new Vector2(14f, 52f), new Vector2(10f, 10f));
        var eyeRImg = eyeR.AddComponent<Image>();
        eyeRImg.sprite = knob;
        eyeRImg.color = new Color(0.1f, 0.06f, 0.02f);

        var bodyGO = new GameObject("Body");
        bodyGO.transform.SetParent(pp, false);
        AnchorPos(bodyGO, new Vector2(0f, -48f), new Vector2(64f, 88f));
        var bodyImg = bodyGO.AddComponent<Image>();
        bodyImg.color = new Color(0.94f, 0.94f, 0.94f);

        // ── Controls (right column) ──
        var nameLabel = MakeTMP(ct, "NameLabel", "Your Name", 18);
        nameLabel.color = new Color(0.78f, 0.68f, 0.50f);
        AnchorPos(nameLabel.gameObject, new Vector2(75f, 218f), new Vector2(190f, 28f));

        var nameInput = MakeTMPInputField(ct, new Vector2(75f, 173f), new Vector2(190f, 46f));

        var skinLabel = MakeTMP(ct, "SkinLabel", "Skin Tone", 18);
        skinLabel.color = new Color(0.78f, 0.68f, 0.50f);
        AnchorPos(skinLabel.gameObject, new Vector2(75f, 112f), new Vector2(190f, 28f));

        Color[] tones = {
            new Color(1.00f, 0.87f, 0.75f),
            new Color(0.94f, 0.76f, 0.58f),
            new Color(0.78f, 0.58f, 0.39f),
            new Color(0.55f, 0.35f, 0.20f),
            new Color(0.35f, 0.22f, 0.13f),
        };
        var skinBtns = new Button[5];
        float[] skinX = { 3f, 39f, 75f, 111f, 147f };
        for (int i = 0; i < 5; i++)
        {
            var sb = new GameObject("SkinBtn_" + i);
            sb.transform.SetParent(ct, false);
            AnchorPos(sb, new Vector2(skinX[i], 76f), new Vector2(32f, 32f));
            sb.AddComponent<Image>().color = tones[i];
            skinBtns[i] = sb.AddComponent<Button>();
        }

        var genderLabel = MakeTMP(ct, "GenderLabel", "Gender", 18);
        genderLabel.color = new Color(0.78f, 0.68f, 0.50f);
        AnchorPos(genderLabel.gameObject, new Vector2(75f, 22f), new Vector2(190f, 28f));

        var hombreBtn = MakeButton(ct, "GenderHombre", "Hombre", 18, new Color(0.25f, 0.65f, 0.95f));
        AnchorPos(hombreBtn.gameObject, new Vector2(30f, -16f), new Vector2(84f, 40f));

        var mujerBtn = MakeButton(ct, "GenderMujer", "Mujer", 18, new Color(0.28f, 0.28f, 0.28f));
        AnchorPos(mujerBtn.gameObject, new Vector2(122f, -16f), new Vector2(84f, 40f));

        var outfitSectionLabel = MakeTMP(ct, "OutfitSectionLabel", "Outfit", 18);
        outfitSectionLabel.color = new Color(0.78f, 0.68f, 0.50f);
        AnchorPos(outfitSectionLabel.gameObject, new Vector2(75f, -72f), new Vector2(190f, 28f));

        var prevBtn = MakeButton(ct, "PrevOutfit", "<", 26, new Color(0.22f, 0.22f, 0.22f));
        AnchorPos(prevBtn.gameObject, new Vector2(28f, -112f), new Vector2(44f, 44f));

        var outfitName = MakeTMP(ct, "OutfitName", "White Tee", 19);
        AnchorPos(outfitName.gameObject, new Vector2(85f, -112f), new Vector2(106f, 44f));

        var nextBtn = MakeButton(ct, "NextOutfit", ">", 26, new Color(0.22f, 0.22f, 0.22f));
        AnchorPos(nextBtn.gameObject, new Vector2(140f, -112f), new Vector2(44f, 44f));

        var startBtn = MakeButton(ct, "StartButton", "Start Game", 28, new Color(0.88f, 0.38f, 0.08f));
        AnchorPos(startBtn.gameObject, new Vector2(75f, -205f), new Vector2(200f, 62f));

        // ── Wire controller ──
        var ctrl = new GameObject("Controller").AddComponent<CharacterCustomizationController>();
        ctrl.headImage       = headImg;
        ctrl.hairImage       = hairImg;
        ctrl.bodyImage       = bodyImg;
        ctrl.nameInput       = nameInput;
        ctrl.skinToneButtons = skinBtns;
        ctrl.genderHombre    = hombreBtn;
        ctrl.genderMujer     = mujerBtn;
        ctrl.outfitLabel     = outfitName;
        ctrl.prevOutfitButton = prevBtn;
        ctrl.nextOutfitButton = nextBtn;
        ctrl.startButton     = startBtn;

        EditorSceneManager.SaveScene(scene, ScenePath + "CharacterCustomization.unity");
    }

    // ── Scene 1 ────────────────────────────────────────────────────────────────

    static void BuildCutsceneScene()
    {
        var scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);
        AddCamera();
        AddEventSystem();

        var canvas = MakeCanvas();
        var ct = canvas.transform;

        MakePanel(ct, "Background", Color.black);

        var story = MakeTMP(ct, "StoryText", "", 24);
        story.enableWordWrapping = true;
        story.color = Color.white;
        Stretch(story.gameObject, new Vector2(0.07f, 0.25f), new Vector2(0.93f, 0.82f));

        var hint = MakeTMP(ct, "TapHint", "Tap to continue", 18);
        hint.color = new Color(0.55f, 0.55f, 0.55f);
        AnchorPos(hint.gameObject, new Vector2(0, -340), new Vector2(300, 40));

        var tapGO = new GameObject("TapButton");
        tapGO.transform.SetParent(ct, false);
        Stretch(tapGO, Vector2.zero, Vector2.one);
        tapGO.AddComponent<Image>().color = new Color(0, 0, 0, 0);
        var tapBtn = tapGO.AddComponent<Button>();
        var tapCols = tapBtn.colors;
        tapCols.normalColor      = new Color(0, 0, 0, 0);
        tapCols.highlightedColor = new Color(0, 0, 0, 0);
        tapCols.pressedColor     = new Color(1, 1, 1, 0.04f);
        tapBtn.colors = tapCols;
        tapGO.transform.SetAsLastSibling();

        var ctrl = new GameObject("Controller").AddComponent<CutsceneController>();
        ctrl.storyText   = story;
        ctrl.tapHintText = hint;
        ctrl.tapButton   = tapBtn;

        EditorSceneManager.SaveScene(scene, ScenePath + "Cutscene.unity");
    }

    // ── Scene 2 ────────────────────────────────────────────────────────────────

    static void BuildBodegaDayScene()
    {
        var scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);
        AddCamera();
        AddEventSystem();

        var canvas = MakeCanvas();
        var ct = canvas.transform;
        var canvasRT = canvas.GetComponent<RectTransform>();

        MakePanel(ct, "Background", new Color(0.10f, 0.07f, 0.04f));

        // ── HUD bar ──
        var hud = MakePanel(ct, "HUDBar", new Color(0.05f, 0.05f, 0.05f, 0.92f), false);
        Stretch(hud, new Vector2(0f, 0.90f), new Vector2(1f, 1f));

        var dayLbl = MakeTMP(hud.transform, "DayLabel", "Day 1", 20);
        Stretch(dayLbl.gameObject, new Vector2(0f, 0f), new Vector2(0.33f, 1f),
            new Vector2(6, 0), new Vector2(-6, 0));

        var moneyLbl = MakeTMP(hud.transform, "MoneyLabel", "$0.00", 20);
        moneyLbl.color = new Color(0.3f, 1f, 0.3f);
        Stretch(moneyLbl.gameObject, new Vector2(0.33f, 0f), new Vector2(0.66f, 1f),
            new Vector2(6, 0), new Vector2(-6, 0));

        var timerLbl = MakeTMP(hud.transform, "TimerLabel", "90s", 20);
        timerLbl.color = new Color(1f, 0.8f, 0.2f);
        Stretch(timerLbl.gameObject, new Vector2(0.66f, 0f), new Vector2(1f, 1f),
            new Vector2(6, 0), new Vector2(-6, 0));

        // ── Reputation dots ──
        var repRow = new GameObject("ReputationRow");
        repRow.transform.SetParent(ct, false);
        Stretch(repRow, new Vector2(0.2f, 0.84f), new Vector2(0.8f, 0.90f));

        var repDots = new Image[5];
        for (int i = 0; i < 5; i++)
        {
            var dot = new GameObject("RepDot_" + i);
            dot.transform.SetParent(repRow.transform, false);
            AnchorPos(dot, new Vector2(-80f + i * 40f, 0), new Vector2(26, 26));
            repDots[i] = dot.AddComponent<Image>();
            repDots[i].color = new Color(1f, 0.85f, 0.2f);
        }

        // ── 3 customer slots ──
        var slotRoots       = new GameObject[3];
        var slotNameLabels  = new TextMeshProUGUI[3];
        var slotOrderLabels = new TextMeshProUGUI[3];
        var slotFills       = new Image[3];

        float[] slotX = { -125f, 0f, 125f };

        for (int i = 0; i < 3; i++)
        {
            var slot = new GameObject("CustomerSlot_" + i);
            slot.transform.SetParent(ct, false);
            AnchorPos(slot, new Vector2(slotX[i], 120f), new Vector2(112f, 195f));
            slot.AddComponent<Image>().color = new Color(0.18f, 0.12f, 0.08f);
            slotRoots[i] = slot;
            slot.SetActive(false);

            var nameLabel = MakeTMP(slot.transform, "SlotName", "Name", 15);
            nameLabel.color = new Color(0.9f, 0.75f, 0.55f);
            Stretch(nameLabel.gameObject, new Vector2(0f, 0.75f), new Vector2(1f, 1f),
                new Vector2(4, 2), new Vector2(-4, -2));
            slotNameLabels[i] = nameLabel;

            var bubble = new GameObject("OrderBubble");
            bubble.transform.SetParent(slot.transform, false);
            Stretch(bubble, new Vector2(0f, 0.22f), new Vector2(1f, 0.75f),
                new Vector2(4, 4), new Vector2(-4, -4));
            bubble.AddComponent<Image>().color = new Color(0.25f, 0.17f, 0.10f);

            var orderLabel = MakeTMP(bubble.transform, "OrderText", "...", 13);
            orderLabel.color = Color.white;
            orderLabel.enableWordWrapping = true;
            Stretch(orderLabel.gameObject, Vector2.zero, Vector2.one,
                new Vector2(4, 4), new Vector2(-4, -4));
            slotOrderLabels[i] = orderLabel;

            var barBG = new GameObject("PatBG");
            barBG.transform.SetParent(slot.transform, false);
            Stretch(barBG, new Vector2(0f, 0f), new Vector2(1f, 0.22f),
                new Vector2(4, 4), new Vector2(-4, -4));
            barBG.AddComponent<Image>().color = new Color(0.15f, 0.15f, 0.15f);

            var barFill = new GameObject("PatFill");
            barFill.transform.SetParent(barBG.transform, false);
            Stretch(barFill, Vector2.zero, Vector2.one, new Vector2(2, 2), new Vector2(-2, -2));
            var fillImg = barFill.AddComponent<Image>();
            fillImg.color = Color.green;
            fillImg.type = Image.Type.Filled;
            fillImg.fillMethod = Image.FillMethod.Horizontal;
            fillImg.fillOrigin = 0;
            fillImg.fillAmount = 1f;
            slotFills[i] = fillImg;
        }

        // ── Feedback text ──
        var feedback = MakeTMP(ct, "FeedbackText", "", 24);
        feedback.color = Color.green;
        AnchorPos(feedback.gameObject, new Vector2(0, -65f), new Vector2(340f, 50f));

        // ── Shelf ──
        var shelf = new GameObject("Shelf");
        shelf.transform.SetParent(ct, false);
        Stretch(shelf, new Vector2(0f, 0f), new Vector2(1f, 0.28f));
        shelf.AddComponent<Image>().color = new Color(0.07f, 0.05f, 0.03f);

        var shelfLbl = MakeTMP(shelf.transform, "ShelfLabel", "Drag to serve", 15);
        shelfLbl.color = new Color(0.55f, 0.45f, 0.30f);
        Stretch(shelfLbl.gameObject, new Vector2(0f, 0.72f), new Vector2(1f, 1f));

        string[] itemNames = { "Coffee", "Sandwich", "Snacks", "Lottery" };
        BodegaDayController.ItemType[] itemTypes = {
            BodegaDayController.ItemType.Coffee,
            BodegaDayController.ItemType.Sandwich,
            BodegaDayController.ItemType.Snacks,
            BodegaDayController.ItemType.Lottery,
        };
        Color[] itemColors = {
            new Color(0.40f, 0.20f, 0.05f),
            new Color(0.50f, 0.35f, 0.10f),
            new Color(0.20f, 0.45f, 0.15f),
            new Color(0.15f, 0.25f, 0.50f),
        };
        float[] itemX = { -135f, -45f, 45f, 135f };

        var draggables = new DraggableItem[4];
        for (int i = 0; i < 4; i++)
        {
            var item = new GameObject("Item_" + itemNames[i]);
            item.transform.SetParent(shelf.transform, false);
            AnchorPos(item, new Vector2(itemX[i], -18f), new Vector2(76f, 60f));
            item.AddComponent<Image>().color = itemColors[i];
            item.AddComponent<CanvasGroup>();
            var drag = item.AddComponent<DraggableItem>();
            drag.itemType = itemTypes[i];
            draggables[i] = drag;

            var lbl = MakeTMP(item.transform, "Label", itemNames[i], 15);
            lbl.color = Color.white;
            Stretch(lbl.gameObject, Vector2.zero, Vector2.one);
        }

        // ── End-of-day overlay ──
        var endOverlay = MakePanel(ct, "EndOverlay", new Color(0f, 0f, 0f, 0.88f));
        endOverlay.SetActive(false);

        var endSummary = MakeTMP(endOverlay.transform, "EndSummary", "", 20);
        endSummary.color = Color.white;
        endSummary.enableWordWrapping = true;
        Stretch(endSummary.gameObject, new Vector2(0.08f, 0.30f), new Vector2(0.92f, 0.82f));

        var endBtn = MakeButton(endOverlay.transform, "EndButton", "End Day", 28,
            new Color(0.88f, 0.38f, 0.08f));
        AnchorPos(endBtn.gameObject, new Vector2(0, -120), new Vector2(220, 62));

        // ── Morning overlay (on top of everything) ──
        var morningOverlay = MakePanel(ct, "MorningOverlay", new Color(0f, 0f, 0f, 0.92f));

        var morningTitle = MakeTMP(morningOverlay.transform, "MorningTitle", "Day 1", 40);
        morningTitle.color = new Color(1f, 0.85f, 0.3f);
        morningTitle.enableWordWrapping = true;
        AnchorPos(morningTitle.gameObject, new Vector2(0, 160f), new Vector2(340f, 90f));

        var morningBills = MakeTMP(morningOverlay.transform, "MorningBills", "", 22);
        morningBills.color = new Color(0.9f, 0.85f, 0.75f);
        morningBills.enableWordWrapping = true;
        AnchorPos(morningBills.gameObject, new Vector2(0, -10f), new Vector2(320f, 220f));

        var openBtn = MakeButton(morningOverlay.transform, "OpenButton", "Open the Bodega", 26,
            new Color(0.88f, 0.38f, 0.08f));
        AnchorPos(openBtn.gameObject, new Vector2(0, -230f), new Vector2(260f, 64f));

        // ── Wire controller ──
        var ctrl = new GameObject("Controller").AddComponent<BodegaDayController>();
        ctrl.dayLabel          = dayLbl;
        ctrl.moneyLabel        = moneyLbl;
        ctrl.timerLabel        = timerLbl;
        ctrl.reputationDots    = repDots;
        ctrl.slotRoots         = slotRoots;
        ctrl.slotNameLabels    = slotNameLabels;
        ctrl.slotOrderLabels   = slotOrderLabels;
        ctrl.slotPatienceFills = slotFills;
        ctrl.feedbackText      = feedback;
        ctrl.morningOverlay    = morningOverlay;
        ctrl.morningTitleText  = morningTitle;
        ctrl.morningBillText   = morningBills;
        ctrl.openButton        = openBtn;
        ctrl.endOverlay        = endOverlay;
        ctrl.endSummaryText    = endSummary;
        ctrl.endButton         = endBtn;
        ctrl.canvasRect        = canvasRT;

        foreach (var drag in draggables)
            drag.controller = ctrl;

        EditorSceneManager.SaveScene(scene, ScenePath + "BodegaDay.unity");
    }

    // ── Scene 3 ────────────────────────────────────────────────────────────────

    static void BuildGameOverScene()
    {
        var scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);
        AddCamera();
        AddEventSystem();

        var canvas = MakeCanvas();
        var ct = canvas.transform;

        MakePanel(ct, "Background", new Color(0.05f, 0.03f, 0.02f));

        var titleTxt = MakeTMP(ct, "TitleText", "Day Complete!", 42);
        titleTxt.color = new Color(1f, 0.85f, 0.3f);
        AnchorPos(titleTxt.gameObject, new Vector2(0, 220), new Vector2(360, 68));

        var summaryTxt = MakeTMP(ct, "SummaryText", "", 22);
        summaryTxt.color = Color.white;
        summaryTxt.enableWordWrapping = true;
        AnchorPos(summaryTxt.gameObject, new Vector2(0, 20), new Vector2(340, 260));

        var playAgainBtn = MakeButton(ct, "PlayAgainButton", "Next Day", 28,
            new Color(0.88f, 0.38f, 0.08f));
        AnchorPos(playAgainBtn.gameObject, new Vector2(0, -195), new Vector2(240, 62));

        var ctrl = new GameObject("Controller").AddComponent<GameOverController>();
        ctrl.titleText       = titleTxt;
        ctrl.summaryText     = summaryTxt;
        ctrl.playAgainButton = playAgainBtn;

        EditorSceneManager.SaveScene(scene, ScenePath + "GameOver.unity");
    }

    // ── Build settings ─────────────────────────────────────────────────────────

    static void SetBuildSettings()
    {
        EditorBuildSettings.scenes = new EditorBuildSettingsScene[]
        {
            new EditorBuildSettingsScene(ScenePath + "CharacterCustomization.unity", true),
            new EditorBuildSettingsScene(ScenePath + "Cutscene.unity",               true),
            new EditorBuildSettingsScene(ScenePath + "BodegaDay.unity",              true),
            new EditorBuildSettingsScene(ScenePath + "GameOver.unity",               true),
        };
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    static Canvas MakeCanvas()
    {
        var go = new GameObject("Canvas");
        var c = go.AddComponent<Canvas>();
        c.renderMode = RenderMode.ScreenSpaceOverlay;
        var scaler = go.AddComponent<CanvasScaler>();
        scaler.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
        scaler.referenceResolution = new Vector2(390, 844);
        scaler.screenMatchMode = CanvasScaler.ScreenMatchMode.MatchWidthOrHeight;
        scaler.matchWidthOrHeight = 0.5f;
        go.AddComponent<GraphicRaycaster>();
        return c;
    }

    static void AddCamera()
    {
        var go = new GameObject("Main Camera");
        go.tag = "MainCamera";
        var cam = go.AddComponent<Camera>();
        cam.clearFlags = CameraClearFlags.SolidColor;
        cam.backgroundColor = Color.black;
        cam.orthographic = true;
        go.AddComponent<AudioListener>();
    }

    static void AddEventSystem()
    {
        var go = new GameObject("EventSystem");
        go.AddComponent<EventSystem>();
        go.AddComponent<StandaloneInputModule>();
    }

    static GameObject MakePanel(Transform parent, string name, Color color, bool fullStretch = true)
    {
        var go = new GameObject(name);
        go.transform.SetParent(parent, false);
        go.AddComponent<Image>().color = color;
        if (fullStretch) Stretch(go, Vector2.zero, Vector2.one);
        return go;
    }

    static TextMeshProUGUI MakeTMP(Transform parent, string name, string text, float size,
        TextAlignmentOptions align = TextAlignmentOptions.Center)
    {
        var go = new GameObject(name);
        go.transform.SetParent(parent, false);
        var t = go.AddComponent<TextMeshProUGUI>();
        t.text = text;
        t.fontSize = size;
        t.alignment = align;
        t.color = Color.white;
        return t;
    }

    static Button MakeButton(Transform parent, string name, string label, float fontSize, Color bg)
    {
        var go = new GameObject(name);
        go.transform.SetParent(parent, false);
        go.AddComponent<Image>().color = bg;
        var btn = go.AddComponent<Button>();

        var lgo = new GameObject("Label");
        lgo.transform.SetParent(go.transform, false);
        var tmp = lgo.AddComponent<TextMeshProUGUI>();
        tmp.text = label;
        tmp.fontSize = fontSize;
        tmp.alignment = TextAlignmentOptions.Center;
        tmp.color = Color.white;
        var lrt = lgo.GetComponent<RectTransform>();
        lrt.anchorMin = Vector2.zero;
        lrt.anchorMax = Vector2.one;
        lrt.offsetMin = Vector2.zero;
        lrt.offsetMax = Vector2.zero;

        return btn;
    }

    static TMP_InputField MakeTMPInputField(Transform parent, Vector2 anchoredPos, Vector2 size)
    {
        var go = new GameObject("NameInput");
        go.transform.SetParent(parent, false);
        AnchorPos(go, anchoredPos, size);
        go.AddComponent<Image>().color = new Color(0.18f, 0.18f, 0.18f);
        var field = go.AddComponent<TMP_InputField>();

        var area = new GameObject("Text Area");
        area.transform.SetParent(go.transform, false);
        area.AddComponent<RectMask2D>();
        var art = area.GetComponent<RectTransform>();
        art.anchorMin = Vector2.zero;
        art.anchorMax = Vector2.one;
        art.offsetMin = new Vector2(6, 2);
        art.offsetMax = new Vector2(-6, -2);

        var textGO = new GameObject("Text");
        textGO.transform.SetParent(area.transform, false);
        var textComp = textGO.AddComponent<TextMeshProUGUI>();
        textComp.fontSize = 20;
        textComp.color = Color.white;
        textComp.alignment = TextAlignmentOptions.Left;
        SetFullRect(textGO);

        var phGO = new GameObject("Placeholder");
        phGO.transform.SetParent(area.transform, false);
        var phComp = phGO.AddComponent<TextMeshProUGUI>();
        phComp.text = "Enter your name...";
        phComp.fontSize = 20;
        phComp.color = new Color(0.45f, 0.45f, 0.45f);
        phComp.fontStyle = FontStyles.Italic;
        phComp.alignment = TextAlignmentOptions.Left;
        SetFullRect(phGO);

        field.textViewport = art;
        field.textComponent = textComp;
        field.placeholder = phComp;

        return field;
    }

    static void AnchorPos(GameObject go, Vector2 pos, Vector2 size)
    {
        var rt = go.GetComponent<RectTransform>();
        if (rt == null) rt = go.AddComponent<RectTransform>();
        rt.anchorMin = new Vector2(0.5f, 0.5f);
        rt.anchorMax = new Vector2(0.5f, 0.5f);
        rt.anchoredPosition = pos;
        rt.sizeDelta = size;
    }

    static void Stretch(GameObject go, Vector2 anchorMin, Vector2 anchorMax,
        Vector2 offsetMin = default, Vector2 offsetMax = default)
    {
        var rt = go.GetComponent<RectTransform>();
        if (rt == null) rt = go.AddComponent<RectTransform>();
        rt.anchorMin = anchorMin;
        rt.anchorMax = anchorMax;
        rt.offsetMin = offsetMin;
        rt.offsetMax = offsetMax;
    }

    static void SetFullRect(GameObject go)
    {
        var rt = go.GetComponent<RectTransform>();
        rt.anchorMin = Vector2.zero;
        rt.anchorMax = Vector2.one;
        rt.offsetMin = Vector2.zero;
        rt.offsetMax = Vector2.zero;
    }
}
